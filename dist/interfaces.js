/**
 * @file Interfaces for front-end (react application)
 *       and back-end (background script).
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

/**
 * @typedef {Object} NewsItem
 * @property {string} title - News item title.
 * @property {string} link - News item URL.
 * @property {string} description - News item description.
 * @property {string?} image - News item image.
 */

/**
 * @typedef {Object} NewsItemList
 * @property {string} name - News name.
 * @property {NewsItem[]} items - List of items.
 */
