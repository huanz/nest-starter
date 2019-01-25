import { Store } from 'express-session';
import { LessThan, getConnection, Repository, ObjectType } from 'typeorm';

export interface SessionEntity {
  /**
   * The randomly generated session ID.
   */
  id: string;

  /**
   * The UNIX timestamp at which the session will expire.
   */
  expiresAt: number;

  /**
   * The JSON data of the session.
   */
  data: string;
}

export interface Options {
  repository: string | ObjectType<SessionEntity>;

  /**
   * Session TTL in seconds. Defaults to 86400 (1 day).
   */
  ttl?: number;

  /**
   * Whether to remove expired sessions from the database. Defaults to true.
   */
  clearExpired?: boolean;

  /**
   * The interval between checking for expired sessions in seconds. Defaults to 86400 (1 day).
   */
  expirationInterval?: number;
}

export class TypeormStore extends Store {
  private readonly repository: Repository<SessionEntity>;
  private readonly ttl?: number;
  private readonly expirationInterval: number;
  private expirationIntervalId?: NodeJS.Timeout;
  private clearExpired: boolean | undefined;

  constructor(options: Options) {
    super(options);
    this.repository = getConnection().getRepository(options.repository);
    this.ttl = options.ttl;
    this.expirationInterval = options.expirationInterval || 86400;
    this.clearExpired = options.clearExpired;
  }

  all = (callback: (error: any, result?: any) => void): void => {
    this.repository
      .find()
      .then((sessions: SessionEntity[]) => sessions.map(session => JSON.parse(session.data)))
      .then((data: any) => callback(null, data))
      .catch((error: any) => callback(error));
  };

  destroy = (id: string, callback?: (error: any) => void): void => {
    this.repository
      .delete(id)
      .then(() => callback && callback(null))
      .catch((error: any) => callback && callback(error));
  };

  clear = (callback?: (error: any) => void): void => {
    this.repository
      .clear()
      .then(() => callback && callback(null))
      .catch((error: any) => callback && callback(error));
  };

  length = (callback: (error: any, length: number) => void): void => {
    this.repository
      .count()
      .then((length: number) => callback(null, length))
      .catch((error: any) => callback(error, 0));
  };

  get = (id: string, callback: (error: any, session?: any) => void): void => {
    this.repository
      .findOne(id)
      .then(async (session: SessionEntity | undefined) => {
        if (!session) {
          return callback(null);
        }
        const data = JSON.parse(session.data);
        callback(null, data);
      })
      .catch((error: any) => callback(error));
  };

  set = (id: string, session: any, callback?: (error: any) => void) => {
    let data;
    try {
      data = JSON.stringify(session);
    } catch (error) {
      if (callback) {
        return callback(error);
      }
      throw error;
    }
    const ttl = this.getTTL(session);
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;
    this.repository
      .save({ id, data, expiresAt })
      .then(() => callback && callback(null))
      .catch((error: any) => callback && callback(error));

    // clear
    if (this.clearExpired === undefined || this.clearExpired) {
      this.clearExpiredSessions();
    }
  };

  touch = (id: string, session: any, callback?: (error: any) => void): void => {
    const ttl = this.getTTL(session);
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;

    this.repository
      .update(id, { expiresAt })
      .then(() => callback && callback(null))
      .catch((error: any) => callback && callback(error));
  };

  /**
   * Remove all expired sessions from the database.
   * @param {(error: any) => void} callback
   */
  clearExpiredSessions(callback?: (error: any) => void) {
    const timestamp = Math.round(new Date().getTime() / 1000);

    this.repository
      .delete({ expiresAt: LessThan(timestamp) })
      .then(() => callback && callback(null))
      .catch((error: any) => callback && callback(error));
  }

  /**
   * Set the expiration interval in seconds. If the interval in seconds is not set, it defaults to the store's expiration interval.
   * @param {number} interval
   */
  setExpirationInterval(interval?: number) {
    interval = interval || this.expirationInterval;

    this.clearExpirationInterval();
    this.expirationIntervalId = setInterval(this.clearExpiredSessions, interval);
  }

  /**
   * Clear the expiration interval if it exists.
   */
  clearExpirationInterval() {
    if (this.expirationIntervalId) {
      clearInterval(this.expirationIntervalId);
    }

    this.expirationIntervalId = undefined;
  }

  private getTTL(session: any): number {
    if (this.ttl) {
      return this.ttl;
    }
    return session.cookie && session.cookie.maxAge ? Math.floor(session.cookie.maxAge / 1000) : 86400;
  }
}
