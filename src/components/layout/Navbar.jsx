import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBagShopping, faBars, faMagnifyingGlass, faUser, faXmark, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/category/modern', label: 'Modern' },
  { to: '/category/luxury', label: 'Luxury' },
  { to: '/category/wooden', label: 'Wooden' },
  { to: '/blog', label: 'Journal' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const listVariants = { open: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } }, closed: {} }
const itemVariants = { open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 24 } }

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [q, setQ] = useState('')
  const { count } = useCart()
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()
  const { scrollY } = useScroll()

  // Hide the navbar when scrolling down, show it again when scrolling up
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(y > prev && y > 180)
    setScrolled(y > 20)
  })

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open])

  const close = () => setOpen(false)
  const onSearch = (e) => {
    e.preventDefault()
    if (!q.trim()) return
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`)
    setQ('')
    close()
  }

  return (
    <>
      <motion.header
        className={`nb ${scrolled ? 'scrolled' : ''}`}
        animate={{ y: hidden && !open ? '-100%' : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container nb-inner">
          <Link to="/" className="logo" onClick={close}>Time<span>Nest</span></Link>

          <nav className="nb-links" aria-label="Main">
            {LINKS.map((l) => <NavLink key={l.to} to={l.to}>{l.label}</NavLink>)}
          </nav>

          <div className="nb-actions">
            <form className="nb-search" onSubmit={onSearch} role="search">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search clocks" />
              <button type="submit" aria-label="Search"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
            </form>

            {isLoggedIn ? (
              <>
                <Link to="/my-orders" className="icon-btn" aria-label="My orders" title={user?.name || 'My orders'}><FontAwesomeIcon icon={faUser} /></Link>
                <button className="link-btn nb-logout" onClick={logout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="icon-btn" aria-label="Login"><FontAwesomeIcon icon={faUser} /></Link>
            )}

            <Link to="/cart" className="icon-btn cart-btn" aria-label={`Cart, ${count} items`}>
              <FontAwesomeIcon icon={faBagShopping} />
              {count > 0 && (
                <motion.span key={count} className="badge" initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                  {count}
                </motion.span>
              )}
            </Link>

            <button className="icon-btn nb-menu" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="drawer-overlay" onClick={close} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside
              className="drawer"
              role="dialog"
              aria-label="Menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="drawer-top">
                <span className="logo">Time<span>Nest</span></span>
                <button className="icon-btn" onClick={close} aria-label="Close menu"><FontAwesomeIcon icon={faXmark} /></button>
              </div>

              <form className="drawer-search" onSubmit={onSearch} role="search">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clocks" aria-label="Search clocks" />
                <button type="submit" aria-label="Search"><FontAwesomeIcon icon={faMagnifyingGlass} /></button>
              </form>

              <motion.nav className="drawer-links" variants={listVariants} initial="closed" animate="open" aria-label="Mobile">
                {LINKS.map((l) => (
                  <motion.div key={l.to} variants={itemVariants}>
                    <NavLink to={l.to} onClick={close}>{l.label}<FontAwesomeIcon icon={faArrowRight} /></NavLink>
                  </motion.div>
                ))}
              </motion.nav>

              <div className="drawer-foot">
                {isLoggedIn ? (
                  <>
                    <Link to="/my-orders" onClick={close} className="btn btn-ghost">My orders</Link>
                    <button className="btn btn-ghost" onClick={() => { logout(); close() }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={close} className="btn btn-ghost">Login</Link>
                    <Link to="/signup" onClick={close} className="btn btn-gold">Sign up</Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
