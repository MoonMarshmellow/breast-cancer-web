import Navbar from "@/components/navbar"

export default function ConsoleLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
    <>
    <div className="w-full"><Navbar/></div>
    <div>{children}</div>
    </>
    )
  }