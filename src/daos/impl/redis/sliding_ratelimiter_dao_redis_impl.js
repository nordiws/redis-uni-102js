const redis = require('./redis_client');
/* eslint-disable no-unused-vars */
const keyGenerator = require('./redis_key_generator');
const timeUtils = require('../../../utils/time_utils');
/* eslint-enable */

/* eslint-disable no-unused-vars */

// Challenge 7
const hitSlidingWindow = async (name, opts) => {
  const client = redis.getClient();
  let response = -1;
  // START Challenge #7
  const transaction = client.multi();
  const key = keyGenerator.getRateLimiterKey(name, opts.interval, opts.maxHits);
  const now = new Date().getTime();
  transaction.zadd(key, now, now + name);
  transaction.zremrangebyscore(key, 0, now - opts.interval);
  transaction.zcard(key);
  transaction.expire(key, opts.interval);
  const results = await transaction.execAsync();
  const hits = results[results.length - 2];
  if (hits <= opts.maxHits) {
    response = opts.maxHits - hits;
  }
  return response;
  // END Challenge #7
};

/* eslint-enable */

module.exports = {
  /**
   * Record a hit against a unique resource that is being
   * rate limited.  Will return 0 when the resource has hit
   * the rate limit.
   * @param {string} name - the unique name of the resource.
   * @param {Object} opts - object containing interval and maxHits details:
   *   {
   *     interval: 1,
   *     maxHits: 5
   *   }
   * @returns {Promise} - Promise that resolves to number of hits remaining,
   *   or 0 if the rate limit has been exceeded..
   */
  hit: hitSlidingWindow,
};
