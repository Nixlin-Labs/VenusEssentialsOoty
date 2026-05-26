const slugifyLib = require('slugify');

/**
 * Generate URL-friendly slug from text.
 * @param {string} text - Input text
 * @param {object} options - Slugify options
 * @returns {string} - URL slug
 */
const generateSlug = (text, options = {}) => {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    trim: true,
    ...options,
  });
};

/**
 * Generate unique slug by checking database.
 * @param {object} Model - Mongoose model
 * @param {string} text - Input text
 * @param {string} excludeId - ID to exclude from uniqueness check (for updates)
 * @returns {string} - Unique slug
 */
const generateUniqueSlug = async (Model, text, excludeId = null) => {
  let slug = generateSlug(text);
  let counter = 0;
  let exists = true;

  while (exists) {
    const currentSlug = counter === 0 ? slug : `${slug}-${counter}`;
    const query = { slug: currentSlug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const found = await Model.findOne(query);
    if (!found) {
      slug = currentSlug;
      exists = false;
    } else {
      counter++;
    }
  }

  return slug;
};

module.exports = { generateSlug, generateUniqueSlug };
