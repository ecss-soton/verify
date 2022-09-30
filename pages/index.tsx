import Head from "next/head";
import {Steps} from "@/components/Steps";
import {useSession} from "next-auth/react";
import {MangeLink} from "@/components/MangeLink";
import { useRouter } from "next/router";

export default function Home() {
    const router = useRouter();
    const { data: session } = useSession();

    let linkFlow = true;

    if (session?.discord.tag) {
        linkFlow = false;
    }

    if (router.query.callback && session?.discord.tag) {
        if (!Array.isArray(router.query.callback)) {
             router.push(router.query.callback)
        }

    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <Head>
                <title>ECSS Verify</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">

                <h1 className="font-bold text-6xl m-5"><span className="text-[#005C85]">Soton</span> Verify</h1>

                <svg width="150" height="251" viewBox="0 0 150 251" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd"
                          d="M147.507 77.2834C147.031 77.0654 142.512 75.0417 134.957 72.5828V57.5452C134.957 25.7634 108.466 0 75.8145 0C43.1626 0 16.6714 25.7634 16.6714 57.5452V72.147C8.15869 74.8098 3.00977 77.0745 2.49268 77.3018L0 78.4019V141.657C0.539551 155.765 3.08252 169.728 7.55371 183.138C18.9692 216.886 41.9331 240.216 73.98 250.586C74.4038 250.724 74.8467 250.793 75.293 250.792C75.7383 250.792 76.1812 250.723 76.605 250.586C108.709 240.216 131.521 216.857 142.701 183.035C147.055 169.677 149.499 155.785 149.962 141.76V141.564C150.047 138.48 149.962 78.4019 149.962 78.4019L147.507 77.2834ZM108.671 57.5452V66.0183C98.7959 64.2534 87.4912 63 75.3022 63C63.5811 63 52.6284 64.1614 42.957 65.823V57.5452C42.957 39.8899 57.6606 25.5757 75.8145 25.5757C93.9678 25.5757 108.671 39.8899 108.671 57.5452ZM74.5093 134.92C75.4399 135.628 76.4072 136.288 77.4077 136.896C79.4004 138.181 78.6826 141.247 76.6899 144.275L76.6064 144.409C75.9531 145.452 74.2539 148.164 74.4619 153.676C74.7036 156.077 75.3418 158.421 76.3501 160.617C74.4082 160.503 72.46 160.61 70.543 160.935C70.4995 160.943 70.4556 160.948 70.4116 160.95C70.3013 160.955 70.1904 160.938 70.0854 160.9C69.9385 160.848 69.8101 160.757 69.7124 160.637C69.1362 159.966 68.5605 159.276 67.9468 158.642C65.2354 155.756 59.7979 154.618 56.5439 153.937C56.1948 153.864 55.8706 153.796 55.5776 153.732C54.6328 153.556 49.1851 152.195 48.4673 151.944C48.1318 151.778 47.7847 151.638 47.4287 151.524C47.2476 151.508 47.0679 151.481 46.8911 151.443C46.2192 151.301 45.5859 151.011 45.0396 150.592C44.1875 149.9 43.4399 149.09 42.8203 148.189C42.2471 147.287 41.7212 146.359 41.1973 145.432L40.9321 144.965C40.8926 144.894 40.8467 144.828 40.7944 144.767C40.6958 144.65 40.5757 144.552 40.4399 144.478C40.2329 144.364 39.9976 144.31 39.7617 144.322C39.6465 144.341 39.5347 144.374 39.4287 144.42C39.2661 144.491 39.1182 144.592 38.9927 144.719C38.917 144.795 38.8511 144.879 38.7959 144.97C38.7002 145.127 38.6362 145.302 38.6099 145.487C38.5601 146.579 38.8711 147.658 39.4966 148.561C39.5562 148.656 39.6177 148.749 39.6807 148.843C39.7651 148.968 39.8516 149.092 39.938 149.216L40.0728 149.411L40.186 149.577C39.3931 149.46 38.6128 149.273 37.8545 149.018C37.6353 148.927 37.4141 148.842 37.1909 148.762C36.7607 148.608 36.3232 148.472 35.8804 148.356C34.6909 148.16 30.7627 147.052 29.2715 139.84C28.9385 136.921 29.2905 133.966 30.3003 131.203C45.0088 127.494 60.1211 125.573 75.3022 125.482H77.2944C77.2236 125.561 77.1704 125.653 77.1372 125.751C77.1108 125.829 77.0972 125.911 77.0972 125.995C77.0972 126.08 77.1118 126.165 77.1396 126.245C77.1733 126.341 77.2256 126.43 77.2944 126.507C77.4683 126.729 77.8374 127.056 78.2822 127.451C79.2402 128.3 80.5474 129.46 81.0049 130.542C82.5728 134.371 81.5718 136.02 81.1748 136.645H81.0718L80.8164 136.495C79.8369 135.891 78.1353 134.59 76.8618 133.617C76.0352 132.985 75.3887 132.491 75.2363 132.414C74.3677 131.949 73.9233 132.209 73.5742 132.684C73.4204 132.893 73.4312 133.231 73.5581 133.597C73.6465 133.853 73.7915 134.122 73.9766 134.37C74.1299 134.574 74.3105 134.764 74.5093 134.92ZM79.23 148.897C79.3105 147.244 80.3901 145.172 81.5591 142.927C83.1313 139.908 84.8657 136.577 84.5464 133.542C84.2231 130.578 82.8169 127.832 80.5898 125.817L80.146 125.556C87.6104 125.776 95.0532 126.461 102.429 127.607C103.815 128.857 105.129 130.182 106.367 131.576C106.24 131.576 105.621 131.461 104.86 131.321L104.848 131.319C103.692 131.106 102.214 130.834 101.646 130.812C99.4556 130.877 95.9805 131.231 96.3965 133.085C96.708 133.868 98.4546 133.625 98.8799 133.569C100.216 133.277 101.595 133.229 102.949 133.43C104.728 133.682 106.34 134.599 107.453 135.992C116.074 149.568 98.1055 157.748 90.0605 160.711C83.8286 162.547 78.333 158.605 79.2393 148.906L79.23 148.897ZM26.457 142.887C22.9028 141.129 20.1899 138.064 18.9033 134.352C21.1885 133.644 23.7285 132.899 26.5137 132.144C26.3535 132.815 26.2119 133.532 26.1079 134.296C25.3433 139.785 26.1787 142.101 26.4053 142.729L26.4282 142.793C26.4434 142.836 26.4531 142.867 26.457 142.887ZM41.7065 164.317C41.9775 164.484 42.228 164.68 42.4526 164.904C42.9644 165.413 43.2583 166.18 43.6309 167.153C44.2686 168.82 45.1377 171.092 47.7305 173.709C48.9819 174.817 50.3755 175.756 51.876 176.504C56.8818 178.806 59.5659 178.229 60.9087 177.94C61.126 177.894 61.3081 177.854 61.4595 177.836C61.3843 178.041 61.3369 178.246 61.252 178.433C49.4868 198.847 47.0884 215.497 48.6372 228.29C43.9502 224.746 39.6387 220.745 35.7671 216.345C27.1182 206.552 20.3574 194.57 15.6558 180.734C11.0664 166.943 8.62451 152.546 8.41309 138.032C10.0938 137.371 12.6147 136.439 15.8247 135.368C15.9219 135.698 16.0283 136.026 16.144 136.35C16.2505 136.646 16.3643 136.94 16.4858 137.231C17.3232 139.049 18.4771 140.708 19.8945 142.132C22.9561 145.126 26.333 147.787 29.9697 150.071C36.5151 153.483 46.3657 155.97 47.417 156.235L47.4663 156.248C48.2031 156.434 52.9521 158.009 54.0762 158.196C54.5469 158.233 55.0117 158.321 55.4639 158.457C55.6748 158.533 56.0757 158.632 56.6001 158.762C59.2656 159.422 65.1235 160.872 65.5103 164.149C65.7681 165.7 65.5918 167.292 65.001 168.752C64.874 169.122 64.7305 169.487 64.5708 169.844C64.4302 170.16 64.2778 170.47 64.1133 170.774C64.0942 170.756 64.0728 170.718 64.0464 170.661C64.0269 170.618 64.0044 170.565 63.9775 170.502C63.6128 169.648 62.4854 167.004 57.5034 164.578C53.2905 162.526 49.7471 162.791 47.292 162.974C46.3467 163.045 45.563 163.103 44.9644 163.013C43.8896 162.86 42.7935 163.032 41.8198 163.506C41.6577 163.576 41.5435 163.648 41.4751 163.723C41.3164 163.897 41.4033 164.089 41.7065 164.317ZM134.618 180.706C130.011 194.552 123.288 206.552 114.724 216.354C114.52 216.59 114.305 216.821 114.091 217.051L113.874 217.286C109.763 216.405 105.569 215.959 101.363 215.954C86.2554 215.311 78.7017 209.432 81.3643 200.431C81.374 200.398 81.3882 200.358 81.4043 200.312C81.4619 200.146 81.5488 199.899 81.5771 199.634C81.6104 199.323 81.564 198.989 81.2979 198.735C80.7407 198.204 80.0229 198.642 79.7212 198.8C67.0498 205.556 63.0366 227.684 63.0366 227.684C63.0366 227.684 62.4131 210.419 74.6035 198.885C86.0083 188.092 95.7271 189.436 97.3027 189.654C97.4111 189.669 97.481 189.678 97.5103 189.678C102.458 190.834 102.751 188.626 102.977 188.178C103.194 187.745 103.374 187.296 103.513 186.834C103.63 186.448 103.719 186.053 103.78 185.654C103.788 185.486 103.83 185.322 103.904 185.171C103.979 185.02 104.085 184.886 104.214 184.778C104.66 184.415 105.05 183.991 105.375 183.52C105.876 182.69 109.03 176.942 106.461 174.697C106.282 174.504 106.081 174.334 105.862 174.188C105.647 174.044 105.416 173.925 105.172 173.831C105.004 173.767 104.831 173.716 104.655 173.679C104.319 173.607 103.973 173.586 103.629 173.616C103.46 173.597 103.294 173.564 103.132 173.517C102.932 173.458 102.737 173.379 102.553 173.28C101.377 172.71 100.154 172.24 98.8979 171.873C97.7695 171.546 96.6758 171.111 95.6309 170.578C94.9766 170.286 94.4482 169.774 94.1396 169.134C93.2969 166.789 91.168 165.409 90.3838 164.9C90.2896 164.839 90.2148 164.791 90.1641 164.754C94.064 163.702 97.7788 162.072 101.183 159.919C109.351 154.561 111.145 150.863 111.145 150.863C111.656 149.805 112.524 148.955 113.6 148.459C114.796 147.912 115.894 147.176 116.848 146.278C116.848 146.278 118.094 145.226 117.452 144.107C116.811 142.99 115.205 143.791 114.724 144.107C114.25 144.455 113.7 144.685 113.118 144.778C113.229 144.162 113.229 143.531 113.118 142.915C112.677 137.188 111.276 134.812 110.003 132.651L109.999 132.643C109.774 132.262 109.553 131.887 109.342 131.501C108.707 130.391 107.957 129.347 107.104 128.389C118.888 130.481 130.434 133.711 141.578 138.032C141.465 152.523 139.119 166.912 134.618 180.706ZM79.0474 83.9067C74.5391 79.4146 67.0469 79.4146 62.5391 83.9067L53.4341 93.0544C48.8555 97.6121 48.8555 105.014 53.4341 109.58C57.4873 113.612 63.8037 114.146 68.5391 110.824L68.6689 110.736C69.8364 109.903 70.104 108.287 69.2686 107.123C68.4419 105.96 66.8198 105.693 65.6523 106.453L65.5229 106.614C62.9282 108.465 59.3604 108.174 57.1064 105.919C54.5513 103.374 54.5513 99.1797 57.1064 96.707L66.2036 87.6321C68.7578 85.0947 72.9014 85.0947 75.4473 87.6321C77.7095 89.8867 78.0015 93.4341 76.1445 96.0281L76.0557 96.1575C75.2202 97.313 75.4961 98.9292 76.6636 99.7615C77.8232 100.594 79.4448 100.319 80.2798 99.1636L80.3691 99.0342C83.7017 94.3877 83.1016 87.9473 79.0474 83.9067ZM69.877 104.02C74.458 108.586 81.8774 108.586 86.4585 104.02L95.564 94.9453C100.146 90.3877 100.146 82.9856 95.564 78.4231C91.5098 74.3833 85.1206 73.8564 80.4585 77.177L80.3286 77.2673C79.1611 78.0974 78.8936 79.7126 79.7285 80.8748C80.5557 81.9673 82.1772 82.3066 83.3447 81.4744L83.4746 81.3855C86.0693 79.5342 89.6367 79.8284 91.8911 82.0806C94.4453 84.5532 94.4453 88.7473 91.8911 91.2927L82.7935 100.368C80.2393 102.905 76.0962 102.905 73.5498 100.368C71.2876 98.113 70.9961 94.4927 72.8525 91.9714L72.9419 91.8423C73.7769 90.614 73.5015 88.9978 72.3335 88.238C71.1011 87.4058 69.4795 87.6807 68.7173 88.8362L68.6284 88.9653C65.2959 93.6121 65.8228 99.9797 69.877 104.02Z"
                          fill="#005C85"/>
                </svg>

                {linkFlow ? <Steps/> : <MangeLink/>}


            </main>
        </div>
    );
}