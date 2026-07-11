import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { TransitionCurtain } from "@/components/transition-curtain";
import { getSiteSettings } from "@/lib/site-settings";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loaderVideo } = await getSiteSettings();

  return (
    <>
      <Nav />
      {children}
      <Footer />
      <CartDrawer />
      <TransitionCurtain loaderVideo={loaderVideo} />
    </>
  );
}
