import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDbConnection } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const {
            employeeId,
            firstName,
            lastName,
            middleName,
            address,
            phone,
            dob,
            email,
            factoryName,
            departmentName,
            password,
            permission,
            role = 'user',
            dbName,
            managerId
        } = await req.json();

        if (!email || !password || !dbName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const db = await getDbConnection(dbName);

        const [existingUserRows] = await db.query(
            'SELECT * FROM user_details WHERE user_id = ?',
            [employeeId]
        );

        // You can define a UserRow type if you want more strict typing
        if ((existingUserRows as unknown[]).length > 0) {
            await db.end();
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        await db.query(
            `CALL add_user_to_factory(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                employeeId,         // p_user_id
                firstName,          // p_first_name
                lastName,           // p_last_name
                middleName,         // p_middle_name (can be NULL)
                address,            // p_address
                phone,              // p_phone
                dob,                // p_dob
                email,              // p_email
                factoryName,        // p_factory_name
                departmentName,     // p_department_name
                role,               // p_role_name
                permission,         // p_permission
                passwordHash,       // p_password_hash
                managerId           // p_manager_user_id
            ]
        );

        await db.end();

        return NextResponse.json({ success: true, message: 'User created successfully' });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
