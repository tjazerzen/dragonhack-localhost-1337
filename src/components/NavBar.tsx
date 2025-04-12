import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Circle } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-3 bg-background border-b w-full">
      <div className="">
        <SidebarTrigger className='hover:cursor-pointer mt-1' />
      </div>
      <Button variant='ghost' size='icon'>
        <Circle color='red' className='w-6 h-6'/>
      </Button>
    </nav>
  );
}