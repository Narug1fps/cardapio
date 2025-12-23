'use client'

import { Client, Account, Databases, Storage } from 'appwrite'

const client = new Client()

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'cardapio_db'
export const DISHES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_DISHES_COLLECTION_ID || 'dishes'
export const CATEGORIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories'
export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'dish_images'

export { client }
