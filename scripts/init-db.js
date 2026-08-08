const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 1. Basic environment variable parser
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split(/\r?\n/).forEach(line => {
      // Ignore comments and empty lines
      const cleanLine = line.trim();
      if (!cleanLine || cleanLine.startsWith('#')) return;

      const parts = cleanLine.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim();
        // Remove surrounding quotes if they exist
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    });
  }
}

async function run() {
  loadEnv();

  const host = process.env.NEXT_PUBLIC_DB_HOST;
  const user = process.env.NEXT_PUBLIC_DB_USER;
  const password = process.env.NEXT_PUBLIC_DB_PASSWORD;
  const port = process.env.NEXT_PUBLIC_DB_PORT ? Number(process.env.NEXT_PUBLIC_DB_PORT) : 3306;

  if (!host || !user || !password) {
    console.error('Error: DB connection environment variables are missing in .env file.');
    process.exit(1);
  }

  console.log(`Connecting to MySQL host: ${host}:${port} as ${user}...`);

  let connection;
  try {
    // Connect without database to create/verify it first
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Connected to MySQL server. Ensuring database "innovation" exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS `innovation`;');
    console.log('Database "innovation" verified/created.');

    // Switch context to innovation database
    await connection.query('USE `innovation`;');

    // Create Tables
    console.log('Creating tables if they do not exist...');

    // 1. innovation_approval_workflows
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`innovation_approval_workflows\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`company_id\` int NOT NULL,
        \`factory_id\` int NOT NULL,
        \`department_id\` int DEFAULT NULL,
        \`workflow_name\` varchar(100) NOT NULL,
        \`is_active\` tinyint DEFAULT '1',
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`fk_aw_company\` (\`company_id\`),
        KEY \`fk_aw_factory\` (\`factory_id\`),
        KEY \`fk_aw_dept\` (\`department_id\`),
        CONSTRAINT \`fk_aw_company\` FOREIGN KEY (\`company_id\`) REFERENCES \`org_db\`.\`company_master\` (\`id\`),
        CONSTRAINT \`fk_aw_dept\` FOREIGN KEY (\`department_id\`) REFERENCES \`org_db\`.\`department_master\` (\`id\`),
        CONSTRAINT \`fk_aw_factory\` FOREIGN KEY (\`factory_id\`) REFERENCES \`org_db\`.\`factory_master\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 2. innovation_approval_workflow_stages
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`innovation_approval_workflow_stages\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`workflow_id\` int NOT NULL,
        \`stage_order\` int NOT NULL,
        \`stage_name\` varchar(100) NOT NULL,
        \`stage_type\` enum('MANAGER','DEPARTMENT_HEAD','SAFETY_HEAD','FINANCE_HEAD','FACTORY_HEAD') NOT NULL,
        \`points_on_approval\` int DEFAULT '10',
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_workflow_stage\` (\`workflow_id\`,\`stage_order\`),
        CONSTRAINT \`fk_aws_workflow\` FOREIGN KEY (\`workflow_id\`) REFERENCES \`innovation_approval_workflows\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 3. innovation_ideas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`innovation_ideas\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`company_id\` int NOT NULL,
        \`factory_id\` int NOT NULL,
        \`department_id\` int NOT NULL,
        \`submitted_by\` int NOT NULL,
        \`workflow_id\` int NOT NULL,
        \`current_stage_id\` int DEFAULT NULL,
        \`title\` varchar(255) NOT NULL,
        \`description\` text NOT NULL,
        \`expected_benefit\` text,
        \`category\` varchar(100) DEFAULT NULL,
        \`status\` enum('DRAFT','SUBMITTED','IN_PROGRESS','REJECTED','APPROVED','IMPLEMENTED') DEFAULT 'DRAFT',
        \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_idea_factory_status\` (\`factory_id\`,\`status\`),
        KEY \`fk_idea_company\` (\`company_id\`),
        KEY \`fk_idea_department\` (\`department_id\`),
        KEY \`fk_idea_user\` (\`submitted_by\`),
        KEY \`fk_idea_workflow\` (\`workflow_id\`),
        KEY \`fk_current_stage\` (\`current_stage_id\`),
        CONSTRAINT \`fk_current_stage\` FOREIGN KEY (\`current_stage_id\`) REFERENCES \`innovation_approval_workflow_stages\` (\`id\`),
        CONSTRAINT \`fk_idea_company\` FOREIGN KEY (\`company_id\`) REFERENCES \`org_db\`.\`company_master\` (\`id\`),
        CONSTRAINT \`fk_idea_department\` FOREIGN KEY (\`department_id\`) REFERENCES \`org_db\`.\`department_master\` (\`id\`),
        CONSTRAINT \`fk_idea_factory\` FOREIGN KEY (\`factory_id\`) REFERENCES \`org_db\`.\`factory_master\` (\`id\`),
        CONSTRAINT \`fk_idea_user\` FOREIGN KEY (\`submitted_by\`) REFERENCES \`org_db\`.\`user_master\` (\`id\`),
        CONSTRAINT \`fk_idea_workflow\` FOREIGN KEY (\`workflow_id\`) REFERENCES \`innovation_approval_workflows\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 4. innovation_approval_transactions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`innovation_approval_transactions\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`idea_id\` int NOT NULL,
        \`workflow_stage_id\` int NOT NULL,
        \`approver_id\` int NOT NULL,
        \`status\` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
        \`comments\` text,
        \`actioned_at\` timestamp NULL DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_idea_stage\` (\`idea_id\`,\`workflow_stage_id\`),
        KEY \`idx_approval_pending\` (\`approver_id\`,\`status\`),
        KEY \`fk_iat_stage\` (\`workflow_stage_id\`),
        CONSTRAINT \`fk_iat_idea\` FOREIGN KEY (\`idea_id\`) REFERENCES \`innovation_ideas\` (\`id\`),
        CONSTRAINT \`fk_iat_stage\` FOREIGN KEY (\`workflow_stage_id\`) REFERENCES \`innovation_approval_workflow_stages\` (\`id\`),
        CONSTRAINT \`fk_iat_user\` FOREIGN KEY (\`approver_id\`) REFERENCES \`org_db\`.\`user_master\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 5. innovation_attachments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`innovation_attachments\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`idea_id\` int NOT NULL,
        \`uploaded_by\` int NOT NULL,
        \`file_name\` varchar(255) NOT NULL,
        \`file_path\` varchar(500) NOT NULL,
        \`uploaded_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`fk_attach_idea\` (\`idea_id\`),
        KEY \`fk_attach_user\` (\`uploaded_by\`),
        CONSTRAINT \`fk_attach_idea\` FOREIGN KEY (\`idea_id\`) REFERENCES \`innovation_ideas\` (\`id\`),
        CONSTRAINT \`fk_attach_user\` FOREIGN KEY (\`uploaded_by\`) REFERENCES \`org_db\`.\`user_master\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 6. innovation_implementation
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`innovation_implementation\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`idea_id\` int NOT NULL,
        \`implemented_by\` int NOT NULL,
        \`implementation_notes\` text,
        \`implemented_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_idea_implementation\` (\`idea_id\`),
        KEY \`fk_impl_user\` (\`implemented_by\`),
        CONSTRAINT \`fk_impl_idea\` FOREIGN KEY (\`idea_id\`) REFERENCES \`innovation_ideas\` (\`id\`),
        CONSTRAINT \`fk_impl_user\` FOREIGN KEY (\`implemented_by\`) REFERENCES \`org_db\`.\`user_master\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 7. innovation_points_ledger
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`innovation_points_ledger\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`idea_id\` int NOT NULL,
        \`event_type\` enum('STAGE_APPROVAL','IMPLEMENTED') NOT NULL,
        \`workflow_stage_id\` int DEFAULT NULL,
        \`points\` int NOT NULL,
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`uq_points_once_per_stage\` (\`user_id\`,\`idea_id\`,\`workflow_stage_id\`,\`event_type\`),
        KEY \`idx_points_user\` (\`user_id\`),
        KEY \`fk_points_idea\` (\`idea_id\`),
        KEY \`fk_points_stage\` (\`workflow_stage_id\`),
        CONSTRAINT \`fk_points_idea\` FOREIGN KEY (\`idea_id\`) REFERENCES \`innovation_ideas\` (\`id\`),
        CONSTRAINT \`fk_points_stage\` FOREIGN KEY (\`workflow_stage_id\`) REFERENCES \`innovation_approval_workflow_stages\` (\`id\`),
        CONSTRAINT \`fk_points_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`org_db\`.\`user_master\` (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    // 8. innovation_points_rules
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`innovation_points_rules\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`event_type\` varchar(50) DEFAULT NULL,
        \`points\` int NOT NULL,
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`event_type\` (\`event_type\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);

    console.log('Tables initialized/verified successfully.');

    // Create Stored Procedures (Drop and Recreate to keep updated)
    console.log('Recreating stored procedures...');

    // 1. create_innovation_workflow
    await connection.query('DROP PROCEDURE IF EXISTS `create_innovation_workflow`;');
    await connection.query(`
      CREATE PROCEDURE \`create_innovation_workflow\`(
        IN p_company_id INT,
        IN p_factory_id INT,
        IN p_department_id INT,        -- NULL = applies to all departments
        IN p_workflow_name VARCHAR(100),
        IN p_stages_json JSON          -- JSON array of stages
      )
      BEGIN
        DECLARE v_workflow_id INT;
        DECLARE v_stage_count INT;
        DECLARE v_idx INT DEFAULT 0;

        DECLARE v_stage_name VARCHAR(100);
        DECLARE v_stage_type VARCHAR(50);
        DECLARE v_points INT;

        START TRANSACTION;

        -- 1️⃣ Create workflow
        INSERT INTO innovation_approval_workflows (
          company_id,
          factory_id,
          department_id,
          workflow_name,
          is_active
        )
        VALUES (
          p_company_id,
          p_factory_id,
          p_department_id,
          p_workflow_name,
          1
        );

        SET v_workflow_id = LAST_INSERT_ID();

        -- 2️⃣ Get number of stages
        SET v_stage_count = JSON_LENGTH(p_stages_json);

        -- 3️⃣ Insert stages
        WHILE v_idx < v_stage_count DO

          SET v_stage_name =
            JSON_UNQUOTE(JSON_EXTRACT(p_stages_json, CONCAT('$[', v_idx, '].stage_name')));

          SET v_stage_type =
            JSON_UNQUOTE(JSON_EXTRACT(p_stages_json, CONCAT('$[', v_idx, '].stage_type')));

          SET v_points =
            COALESCE(
              JSON_EXTRACT(p_stages_json, CONCAT('$[', v_idx, '].points')),
              10
            );

          INSERT INTO innovation_approval_workflow_stages (
            workflow_id,
            stage_order,
            stage_name,
            stage_type,
            points_on_approval
          )
          VALUES (
            v_workflow_id,
            v_idx + 1,
            v_stage_name,
            v_stage_type,
            v_points
          );

          SET v_idx = v_idx + 1;

        END WHILE;

        COMMIT;
      END
    `);

    // 2. initiate_innovation
    await connection.query('DROP PROCEDURE IF EXISTS `initiate_innovation`;');
    await connection.query(`
      CREATE PROCEDURE \`initiate_innovation\`(
        IN p_company_id INT,
        IN p_factory_id INT,
        IN p_department_id INT,
        IN p_submitted_by INT,
        IN p_workflow_id INT,
        IN p_title VARCHAR(255),
        IN p_description TEXT,
        IN p_expected_benefit TEXT,
        IN p_category VARCHAR(100)
      )
      BEGIN
        DECLARE v_idea_id INT;

        START TRANSACTION;

        -- 1️⃣ Create idea
        INSERT INTO innovation_ideas (
          company_id,
          factory_id,
          department_id,
          submitted_by,
          workflow_id,
          title,
          description,
          expected_benefit,
          category,
          status
        )
        VALUES (
          p_company_id,
          p_factory_id,
          p_department_id,
          p_submitted_by,
          p_workflow_id,
          p_title,
          p_description,
          p_expected_benefit,
          p_category,
          'IN_PROGRESS'
        );

        SET v_idea_id = LAST_INSERT_ID();

        -- 2️⃣ Seed approval stages
        INSERT INTO innovation_approval_transactions
        (idea_id, workflow_stage_id, approver_id, status)
        SELECT
          v_idea_id,
          aws.id,
          CASE aws.stage_type
            WHEN 'MANAGER' THEN (
              SELECT manager_user_id
              FROM org_db.user_reporting_manager_map
              WHERE user_id = p_submitted_by
                AND effective_to IS NULL
              LIMIT 1
            )
            WHEN 'DEPARTMENT_HEAD' THEN (
              SELECT user_id
              FROM org_db.factory_department_head_map
              WHERE factory_id = p_factory_id
                AND department_id = p_department_id
                AND effective_to IS NULL
              LIMIT 1
            )
            WHEN 'SAFETY_HEAD' THEN (
              SELECT user_id
              FROM org_db.factory_department_head_map
              WHERE factory_id = p_factory_id
                AND department_id = 56
                AND effective_to IS NULL
              LIMIT 1
            )
            WHEN 'FINANCE_HEAD' THEN (
              SELECT user_id
              FROM org_db.factory_department_head_map
              WHERE factory_id = p_factory_id
                AND department_id = 10
                AND effective_to IS NULL
              LIMIT 1
            )
            WHEN 'FACTORY_HEAD' THEN (
              SELECT user_id
              FROM org_db.factory_head_map
              WHERE factory_id = p_factory_id
                AND effective_to IS NULL
              LIMIT 1
            )
          END,
          'PENDING'
        FROM innovation_approval_workflow_stages aws
        WHERE aws.workflow_id = p_workflow_id;

        -- 3️⃣ Set first stage
        UPDATE innovation_ideas
        SET current_stage_id = (
          SELECT id
          FROM innovation_approval_workflow_stages
          WHERE workflow_id = p_workflow_id
          ORDER BY stage_order
          LIMIT 1
        )
        WHERE id = v_idea_id;

        COMMIT;

        -- return idea_id
        SELECT v_idea_id AS idea_id;

      END
    `);

    // 3. process_innovation_stage_action
    await connection.query('DROP PROCEDURE IF EXISTS `process_innovation_stage_action`;');
    await connection.query(`
      CREATE PROCEDURE \`process_innovation_stage_action\`(
        IN p_idea_id INT,
        IN p_approver_id INT,
        IN p_action ENUM('APPROVE','REJECT'),
        IN p_comments TEXT
      )
      BEGIN
        DECLARE v_current_stage_id INT;
        DECLARE v_next_stage_id INT;

        START TRANSACTION;

        /* 1️⃣ Get current stage */
        SELECT current_stage_id
        INTO v_current_stage_id
        FROM innovation_ideas
        WHERE id = p_idea_id
          AND status = 'IN_PROGRESS'
        FOR UPDATE;

        IF v_current_stage_id IS NULL THEN
          SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No active approval stage for this idea';
        END IF;

        /* 2️⃣ APPROVE path */
        IF p_action = 'APPROVE' THEN

          /* Approve only if PENDING and correct approver */
          UPDATE innovation_approval_transactions
          SET status = 'APPROVED',
              comments = p_comments,
              actioned_at = NOW()
          WHERE idea_id = p_idea_id
            AND workflow_stage_id = v_current_stage_id
            AND approver_id = p_approver_id
            AND status = 'PENDING';

          IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Approval failed: invalid approver or stage already processed';
          END IF;

          /* Award points dynamically */
          INSERT INTO innovation_points_ledger
          (user_id, idea_id, event_type, workflow_stage_id, points)
          SELECT
            ii.submitted_by,
            ii.id,
            'STAGE_APPROVAL',
            aws.id,
            aws.points_on_approval
          FROM innovation_ideas ii
          JOIN innovation_approval_workflow_stages aws
            ON aws.id = v_current_stage_id
          WHERE ii.id = p_idea_id
            AND NOT EXISTS (
              SELECT 1
              FROM innovation_points_ledger pl
              WHERE pl.user_id = ii.submitted_by
                AND pl.idea_id = ii.id
                AND pl.workflow_stage_id = aws.id
                AND pl.event_type = 'STAGE_APPROVAL'
            );

          /* Find next stage */
          SELECT aws2.id
          INTO v_next_stage_id
          FROM innovation_approval_workflow_stages aws1
          JOIN innovation_approval_workflow_stages aws2
            ON aws2.workflow_id = aws1.workflow_id
           AND aws2.stage_order = aws1.stage_order + 1
          WHERE aws1.id = v_current_stage_id;

          /* Move or finish */
          IF v_next_stage_id IS NULL THEN

            UPDATE innovation_ideas
            SET status = 'APPROVED',
                current_stage_id = NULL
            WHERE id = p_idea_id;

          ELSE

            UPDATE innovation_ideas
            SET current_stage_id = v_next_stage_id
            WHERE id = p_idea_id;

          END IF;

        /* 3️⃣ REJECT path */
        ELSEIF p_action = 'REJECT' THEN

          UPDATE innovation_approval_transactions
          SET status = 'REJECTED',
              comments = p_comments,
              actioned_at = NOW()
          WHERE idea_id = p_idea_id
            AND workflow_stage_id = v_current_stage_id
            AND approver_id = p_approver_id
            AND status = 'PENDING';

          IF ROW_COUNT() = 0 THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'Rejection failed: invalid approver or stage already processed';
          END IF;

          /* Stop workflow */
          UPDATE innovation_ideas
          SET status = 'REJECTED',
              current_stage_id = NULL
          WHERE id = p_idea_id;

        END IF;

        COMMIT;

      END
    `);

    console.log('Stored procedures recreated successfully.');
    console.log('Database initialization completed.');

  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

run();
