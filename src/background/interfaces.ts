/**
 * @file Interfaces for front-end (react application)
 *       and back-end (background script).
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

export interface INewsItem {
  name: string,
  link: string,
  description: string,
  image?: string
}

export interface INewsItemList {
  name: string,
  items: INewsItem[]
}

export interface ISourceObject {
  id?: number,
  isActive: boolean,
  name: string,
  url: string,
  processing: string
}

export interface INamesListItem {
  id: number,
  name: string,
  isActive: boolean
}

export interface IDefaultSettings {
  [key: string]: any
}
