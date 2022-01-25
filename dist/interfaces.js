/**
 * @file Interfaces for front-end (react application)
 *       and back-end (background script).
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

/**
 * @typedef {Object} NewsItem
 * @property {string} name - News item title.
 * @property {string} link - News item URL.
 * @property {string} description - News item description.
 * @property {string?} image - News item image.
 */

/**
 * @typedef {Object} NewsItemList
 * @property {string} name - News name.
 * @property {NewsItem[]} items - List of items.
 */

/**
 * @typedef {Object} SourceObject
 * @property {number?} id - ID.
 * @property {boolean} isActive - Is source active?
 * @property {string} name - Source name.
 * @property {string} url - Source url.
 * @property {string} processing - Processing code as string.
 */

/**
 * @typedef {Object} NamesListItem
 * @property {number} id - Object ID.
 * @property {string} name - Object name.
 * @property {boolean} isActive - Is source active?
 */
