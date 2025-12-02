/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'https://zvnkrmutyeorqhbzjbrd.supabase.co',
            },
        ],
    },
};

module.exports = nextConfig;
