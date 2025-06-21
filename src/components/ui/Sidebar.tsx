import Logo from "./Logo";
import NavItem from "./NavItem";

const Sidebar = () => {
  return (
    <aside className="h-screen  hidden sm:block w-[250px] lg:w-[280px] border-r border-r-gray-700/30 ">
      <div className="text-center py-3 border-b border-b-gray-700/30">
        <Logo />
      </div>
      <div className="mt-5">
        <NavItem />
      </div>
    </aside>
  );
};

export default Sidebar;
