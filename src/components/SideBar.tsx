import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export default function SideBar() {
  return (
    <Sidebar>
      <SidebarHeader className='pl-4'>
        First Responders AI
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className='pl-4 pb-3'>
        <SidebarMenu className='flex flex-row items-center gap-2'>
          <SidebarMenuItem>
            <Avatar className='w-8 h-8 rounded-full'>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <p className='text-sm'>Svetka Marjetka</p>
          </SidebarMenuItem>
          <SidebarMenuItem className='ml-auto right-0'>
            <Button className="hover:cursor-pointer" variant="ghost" size="icon">
              <LogOut />
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}