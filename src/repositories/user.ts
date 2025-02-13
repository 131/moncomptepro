import _, { result } from 'lodash';
import { getDatabaseConnection } from '../connectors/postgres';
import { QueryResult } from 'pg';

export const findById = async (id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT
  id,
  email,
  encrypted_password,
  reset_password_token,
  reset_password_sent_at,
  sign_in_count,
  last_sign_in_at,
  created_at,
  updated_at,
  legacy_user,
  email_verified,
  verify_email_token,
  verify_email_sent_at,
  given_name,
  family_name,
  phone_number,
  job,
  magic_link_token,
  magic_link_sent_at,
  email_verified_at
FROM users WHERE id = $1
`,
    [id]
  );

  return rows.shift();
};

export const findByEmail = async (email: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT
  id,
  email,
  encrypted_password,
  reset_password_token,
  reset_password_sent_at,
  sign_in_count,
  last_sign_in_at,
  created_at,
  updated_at,
  legacy_user,
  email_verified,
  verify_email_token,
  verify_email_sent_at,
  given_name,
  family_name,
  phone_number,
  job,
  magic_link_token,
  magic_link_sent_at,
  email_verified_at
FROM users WHERE email = $1
`,
    [email]
  );

  return rows.shift();
};

export const findByMagicLinkToken = async (magic_link_token: string) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT
  id,
  email,
  encrypted_password,
  reset_password_token,
  reset_password_sent_at,
  sign_in_count,
  last_sign_in_at,
  created_at,
  updated_at,
  legacy_user,
  email_verified,
  verify_email_token,
  verify_email_sent_at,
  given_name,
  family_name,
  phone_number,
  job,
  magic_link_token,
  magic_link_sent_at,
  email_verified_at
FROM users WHERE magic_link_token = $1
`,
    [magic_link_token]
  );

  return rows.shift();
};

export const findByResetPasswordToken = async (
  reset_password_token: string
) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<User> = await connection.query(
    `
SELECT
  id,
  email,
  encrypted_password,
  reset_password_token,
  reset_password_sent_at,
  sign_in_count,
  last_sign_in_at,
  created_at,
  updated_at,
  legacy_user,
  email_verified,
  verify_email_token,
  verify_email_sent_at,
  given_name,
  family_name,
  phone_number,
  job,
  magic_link_token,
  magic_link_sent_at,
  email_verified_at
FROM users WHERE reset_password_token = $1
`,
    [reset_password_token]
  );

  return rows.shift();
};

export const update = async (id: number, fieldsToUpdate: User) => {
  const connection = getDatabaseConnection();

  const fieldsToUpdateWithTimestamps = {
    ...fieldsToUpdate,
    updated_at: new Date().toISOString(),
  };

  const paramsString = _(fieldsToUpdateWithTimestamps)
    // { email: 'email@xy.z', encrypted_password: 'hash' }
    .toPairs()
    // [[ 'email', 'email@xy.z'], ['encrypted_password', 'hash' ]]
    .map((value, index) => `${value[0]} = $${index + 2}`)
    .value()
    // [ 'email = $2', 'encrypted_password = $3' ]
    .join(', ');
  // 'email = $2, encrypted_password = $3'

  const values = Object.values(fieldsToUpdateWithTimestamps);
  // [ 'email@xy.z', 'hash' ]

  const {
    rows,
  }: QueryResult<User> = await connection.query(
    `UPDATE users SET ${paramsString} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  return rows.shift();
};

export const create = async ({
  email,
  encrypted_password = null,
}: {
  email: string;
  encrypted_password: string | null;
}) => {
  const connection = getDatabaseConnection();

  const userWithTimestamps = {
    email,
    email_verified: false,
    verify_email_token: null,
    verify_email_sent_at: null,
    encrypted_password,
    magic_link_token: null,
    magic_link_sent_at: null,
    reset_password_token: null,
    reset_password_sent_at: null,
    sign_in_count: 0,
    last_sign_in_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const paramsString = Object.keys(userWithTimestamps).join(', ');
  // 'email, encrypted_password'

  const valuesString = _(userWithTimestamps)
    // { email: 'email@xy.z', encrypted_password: 'hash' }
    .toPairs()
    // [[ 'email', 'email@xy.z'], ['encrypted_password', 'hash' ]]
    .map((value, index) => `$${index + 1}`)
    // [ '$1', '$2' ]
    .join(', ');
  // '$1, $2'

  const values = Object.values(userWithTimestamps);
  // [ 'email@xy.z', 'hash' ]

  const { rows }: QueryResult<User> = await connection.query(
    `INSERT INTO users (${paramsString}) VALUES (${valuesString}) RETURNING *;`,
    values
  );

  return rows.shift()!;
};
