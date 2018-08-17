import { Fragment } from 'react'
import Link from 'next/link'

const AdminLink = ({
  isAdminRoute
}) => (
  <div className="link">
    {isAdminRoute && <Link href="/start">🐝</Link>}
    <Link href="/admin">😎</Link>
    <style jsx>{`
        .link {
          position: absolute;
          top: 6px;
          right: 6px;
        }
      `}</style>
  </div>
)

export default AdminLink
