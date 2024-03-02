import { Layout } from '@/lib/component/Layout';
import { PostComponent } from '@/lib/component/PostComponent';
import { getPostsHome } from '@/lib/notion'

export const revalidate = 3600;

const Home = async () => {
  const posts = await getPostsHome();
  return (
    <Layout>
      {posts.map((post) => {
        return (
          <PostComponent post={post} key={post.id} />
        );
      })}
    </Layout>
  );
};

export default Home;