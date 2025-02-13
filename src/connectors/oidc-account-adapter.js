import { isEmpty } from 'lodash';
import { findByUserId as getUsersOrganizations } from '../repositories/organization';
import { findById as findUserById } from '../repositories/user';

export const findAccount = async (ctx, sub, token) => {
  const user = await findUserById(sub);

  if (isEmpty(user)) {
    return null;
  }

  const organizations = await getUsersOrganizations(sub);

  return {
    accountId: sub,
    async claims(use, scope, claims, rejected) {
      const {
        id,
        email,
        email_verified,
        verify_email_token,
        verify_email_sent_at,
        encrypted_password,
        reset_password_token,
        reset_password_sent_at,
        sign_in_count,
        last_sign_in_at,
        created_at,
        updated_at,
        given_name,
        family_name,
        phone_number,
        job,
      } = user;

      return {
        sub: id.toString(), // it is essential to always return a sub claim
        email,
        email_verified,
        updated_at,
        given_name,
        family_name,
        phone_number,
        job,
        organizations: organizations.map(
          ({ id, siret, is_external, cached_libelle: label }) => ({
            id,
            siret,
            is_external,
            label,
          })
        ),
      };
    },
  };
};
