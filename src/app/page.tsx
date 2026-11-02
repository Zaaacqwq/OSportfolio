import { Desktop } from "@/components/Desktop";
import { SystemProvider } from "@/context/System";
import { DataProvider } from "@/context/Data";
import { getGitHubData } from "@/lib/github";
import { getProjectAssets } from "@/lib/assets";
import { getMusicMeta } from "@/lib/spotify";

// 每小时重新拉取一次 GitHub 数据和歌曲封面
export const revalidate = 3600;

export default async function Home() {
  const [github, assets, music] = await Promise.all([getGitHubData(), Promise.resolve(getProjectAssets()), getMusicMeta()]);
  return (
    <DataProvider value={{ github, assets, music }}>
      <SystemProvider>
        <Desktop />
      </SystemProvider>
    </DataProvider>
  );
}
