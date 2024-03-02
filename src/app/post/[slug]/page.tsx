import { notFound } from 'next/navigation'
import 'prism-themes/themes/prism-nord.min.css';
import { getPostContents, getPosts } from '@/lib/notion';
import { Layout } from '@/lib/component/Layout';
import { PostComponent } from '@/lib/component/PostComponent';

export const revalidate = 3600;

const Page = async ({ params }: { params: { slug: string } }) => {
	if (!params) {
		notFound();
	}

	const posts = await getPosts(params.slug);
	const post = posts.shift()
	if (!post) {
		notFound();
	}
	const contents = await getPostContents(post);
	post.contents = contents;

	return (
		<Layout>
			<PostComponent post={post} />
		</Layout>
	);
}

export default Page;