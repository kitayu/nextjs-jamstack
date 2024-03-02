import { Noto_Sans_JP } from 'next/font/google'
import './globals.css'
const notoSansJP = Noto_Sans_JP({
	subsets: ['latin'],
	display: 'swap',
	weight: ['400', '500']
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" className={notoSansJP.className}>
			<body>
				<div>
					{children}
				</div>
			</body>
		</html>
	);
};