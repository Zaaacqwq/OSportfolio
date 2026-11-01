import { Desktop } from "@/components/Desktop";
import { WindowManagerProvider } from "@/context/WindowManager";

export default function Home() {
  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}
