import Sidebar from "../../components/Sidebar";
import Ferrofluid from "../../components/Ferrofluid/Ferrofluid";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background - Fixed and behind content */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Ferrofluid
          colors={["#ffffff", "#ffffff", "#ffffff"]}
          speed={0.5}
          scale={1}
          turbulence={1}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={3}
          shimmer={1}
          glow={2}
          flowDirection="down"
          opacity={1}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.3}
        />
      </div>

      <div className="relative flex h-screen z-10 overflow-hidden">
        {/* Sidebar - Fixed */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 lg:pt-0">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}