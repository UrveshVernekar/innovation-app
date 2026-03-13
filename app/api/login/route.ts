import { getDbConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

interface Permission {
    factory_id: number;
    permission_id: number;
    permission_type: string;
}

interface UserRow {
    id: number;
    username: string;
    password: string;
    role: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    company_name: string;
    company_id: number;
    factory_name: string;
    factory_id: number;
    department: string;
    department_id: number;
}

export async function POST(req: Request) {
    const { username, password, dbName } = await req.json();

    const db = await getDbConnection(dbName);
    const query1 = `
        SELECT
            ud.first_name, ud.last_name, ud.email, ud.phone, rm.role_name AS role,
            um.id, um.company_id, um.factory_id, um.role_id, um.username, um.password,
            fm.factory_name, cm.company_name, udm.department_id, dm.dept_name AS department
        FROM user_master um
        JOIN user_details ud
            ON um.id = ud.user_id
        JOIN roles_master rm
            ON um.role_id = rm.id
        JOIN factory_master fm
            ON um.factory_id = fm.id
        JOIN company_master cm
            ON um.company_id = cm.id
        JOIN user_department_map udm
            ON udm.user_id = um.id
        JOIN department_master dm
            ON dm.id = udm.department_id
        WHERE um.username = ?;
    `;

    const [rows] = await db.query(query1, [username]);

    if (!Array.isArray(rows) || rows.length === 0) {
        await db.end();
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const userRow = rows[0] as UserRow;

    const query2 = `
        SELECT 
            ufp.factory_id AS factoryId,
            c.company_name AS companyName,
            f.factory_name AS factoryName,
            ufp.department_id AS departmentId,
            d.dept_name AS departmentName,
            ufp.permission_id AS permissionId,
            p.name AS permissionType
        FROM user_factory_department_permissions ufp
        JOIN permissions p 
            ON ufp.permission_id = p.id
        JOIN factory_master f 
            ON ufp.factory_id = f.id
        JOIN department_master d 
            ON ufp.department_id = d.id
        JOIN company_master c
			ON c.id = f.company_id
        WHERE ufp.user_id = ?;
    `;

    const [permissionRows] = await db.query(query2, [userRow.id]);
    const permissions = Array.isArray(permissionRows) ? (permissionRows as Permission[]) : [];

    // Validate password
    const isValid = await bcrypt.compare(password, userRow.password);
    if (!isValid) {
        await db.end();
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Sign JWT
    const token = jwt.sign(
        {
            userId: userRow.id,
            username: userRow.username,
            role: userRow.role,
            firstName: userRow.first_name,
            lastName: userRow.last_name,
            email: userRow.email,
            phone: userRow.phone,
            company: userRow.company_name,
            companyID: userRow.company_id,
            factory: userRow.factory_name,
            factoryID: userRow.factory_id,
            department: userRow.department,
            departmentID: userRow.department_id
        },
        process.env.JWT_SECRET!,
        // { expiresIn: '1d' }
        // { expiresIn: '5m' }
        { expiresIn: '4h' }
    );

    const userResponse = {
        id: userRow.id,
        username: userRow.username,
        role: userRow.role,
        firstName: userRow.first_name,
        lastName: userRow.last_name,
        email: userRow.email,
        phone: userRow.phone,
        ompany: userRow.company_name,
        companyID: userRow.company_id,
        factory: userRow.factory_name,
        factoryID: userRow.factory_id,
        department: userRow.department,
        departmentID: userRow.department_id,
        permissions
    };

    const response = NextResponse.json({
        success: true,
        user: userResponse
    });

    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        // secure: false,
        sameSite: 'lax',
        path: '/',
        // maxAge: 60 * 60 * 24
        // maxAge: 60 * 5
        maxAge: 60 * 60
    });

    await db.end();
    return response;
}