
import { authConfig } from "@/configs/auth"
import { getServerSession } from "next-auth"
import Image from "next/image"

export default async function Profile() {
  const session = await getServerSession(authConfig)

  return (
    <main>
      <h1>Профіль користувача {session?.user?.name}</h1>
      {session?.user?.image && <img src={session.user.image} alt="" />}
   </main>
 )
}