import { cache } from 'react';
import 'server-only';
import { Client } from '@notionhq/client';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { Post, Content } from './type';

const notion = new Client({
	auth: process.env.NOTION_TOKEN
});

export const getPosts = cache(async (slug?: string) => {
	let database: QueryDatabaseResponse | undefined = undefined;
	if (slug) {
		database = await notion.databases.query({
			database_id: process.env.NOTION_DATABASE_ID || '',
			filter: {
				and: [
					{
						property: 'Slug',
						rich_text: {
							equals: slug
						}
					}
				]
			}
		});
	} else {
		database = await notion.databases.query({
			database_id: process.env.NOTION_DATABASE_ID || '',
			filter: {
				and: [
					{
						property: 'Published',
						checkbox: {
							equals: true
						}
					}
				]
			},
			sorts: [
				{
					timestamp: 'created_time',
					direction: 'descending'
				}
			]
		});
	}

	if (!database) return [];

	const posts: Post[] = [];
	database.results.forEach((page, index) => {
		if (!('properties' in page)) {
			posts.push({
				id: page.id,
				title: null,
				slug: null,
				createdTs: null,
				lastEditedTs: null,
				contents: []
			});
			return;
		}
		let title: string | null = null;
		if (page.properties['Name'].type === 'title') {
			if (Array.isArray(page.properties['Name'].title)) {
				title = page.properties['Name'].title[0]?.plain_text ?? null;
			} else {
				title = null;
			}
		}

		let slug: string | null = null;
		if (page.properties['Slug'].type === 'rich_text') {
			if (Array.isArray(page.properties['Slug'].rich_text)) {
				slug = page.properties['Slug'].rich_text[0]?.plain_text ?? null;
			} else {
				slug = null;
			}
		}

		posts.push({
			id: page.id,
			title,
			slug,
			createdTs: 'created_time' in page ? page.created_time : null,
			lastEditedTs: 'last_edited_time' in page ? page.last_edited_time : null,
			contents: []
		});
	});
	return posts;
});

export const getPostContents = cache(async (post: Post) => {
	const blockResponse = await notion.blocks.children.list({
		block_id: post.id
	});

	const contents: Content[] = [];
	blockResponse.results.forEach((block) => {
		if (!('type' in block)) {
			return;
		}

		switch (block.type) {
			case 'paragraph':
				contents.push({
					type: 'paragraph',
					text: block.paragraph.rich_text[0]?.plain_text ?? null
				});
				break;
			case 'heading_2':
				contents.push({
					type: 'heading_2',
					text: block.heading_2.rich_text[0]?.plain_text ?? null
				})
				break;
			case 'heading_3':
				contents.push({
					type: 'heading_3',
					text: block.heading_3.rich_text[0]?.plain_text ?? null
				})
				break;
			case 'quote':
				contents.push({
					type: 'quote',
					text: block.quote.rich_text[0]?.plain_text ?? null
				})
				break;
			case 'code':
				contents.push({
					type: 'code',
					text: block.code.rich_text[0]?.plain_text ?? null,
					language: block.code.language
				})
		}
	});

	return contents;
});

export const getPostsHome = async (): Promise<Post[]> => {
	const posts = await getPosts();
	const contentsList = await Promise.all(
		posts.map((post) => {
			return getPostContents(post);
		})
	);
	posts.forEach((post, index) => {
		post.contents = contentsList[index];
	});

	return posts;
};