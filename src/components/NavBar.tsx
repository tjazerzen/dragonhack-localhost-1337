import { SidebarTrigger } from '@/components/ui/sidebar';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-3 bg-background border-b w-full">
      <div className="">
        <SidebarTrigger className='hover:cursor-pointer mt-1' />
      </div>
    </nav>
  );
}