'use client'
import { signOut, useSession } from 'next-auth/react';
import './style.css'
import Link from 'next/link';

const { default: Image } = require("next/image")

const Header = () => {
  const session = useSession();

  return (
    <header className="header">
      <Image
        className="header-logo"
        src="./icons/text-logo.svg"
        width={200}
        height={200}
        alt="header-logo"
      />

      {session?.data ? (
        <Link href="#" onClick={() => signOut({ callbackUrl: "/" })}>
          <button className='header-btn'>Вийти</button>
        </Link>
      ) : (
        <Link href="/api/auth/signin"><button className='header-btn'>Увійти</button></Link>
      )}
    </header>
  );
}

export default Header