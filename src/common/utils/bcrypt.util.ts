/**
 * Utility class for hashing and comparing passwords using bcrypt.
 */
import * as bcrypt from 'bcrypt';

export class BcryptUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Hash a password using bcrypt.
   * @param password The password to hash
   * @returns Promise resolving to the hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Compare a password with a hash.
   * @param password The password to compare
   * @param hash The hash to compare against
   * @returns Promise resolving to whether the password matches the hash
   */
  static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
