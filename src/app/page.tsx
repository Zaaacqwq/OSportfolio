import { Desktop } from "@/components/Desktop";
import { SystemProvider } from "@/context/System";
import { DataProvider } from "@/context/Data";
import { getGitHubData } from "@/lib/github";
import { getProjectAssets } from "@/lib/assets";

// 每小时重新拉取一次 GitHub 数据
export const revalidate = 3600;

export default async function Home() {
  const [github, assets] = await Promise.all([getGitHubData(), Promise.resolve(getProjectAssets())]);
  return (
    <DataProvider value={{ github, assets }}>
      <SystemProvider>
        <Desktop />
      </SystemProvider>
    </DataProvider>
  );
}
