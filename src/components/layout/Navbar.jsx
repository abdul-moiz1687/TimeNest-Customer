import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBagShopping, faBars, faChevronDown, faReceipt, faRightFromBracket, faUser, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { CATEGORIES, getProducts, optimizeImage, productPath } from '../../services/productApi'
import { formatPrice } from '../../utils/format'
import SearchBox from './SearchBox'

const NAV = [
  { key: 'shop', to: '/shop', label: 'Shop', mega: true },
  { key: 'journal', to: '/blog', label: 'Journal' },
  { key: 'about', to: '/about', label: 'About' },
  { key: 'contact', to: '/contact', label: 'Contact' },
]
const hoverCapable = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
const listVariants = { open: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } }, closed: {} }
const itemVariants = { open: { opacity: 1, x: 0 }, closed: { opacity: 0, x: 24 } }
const pop = { initial: { opacity: 0, y: -8, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }

export default function Navbar() {
  const { pathname } = useLocation()
  const { count, openDrawer } = useCart()
  const { isLoggedIn, user, logout } = useAuth()
  const [open, setOpen] = useState(false)          // mobile drawer
  const [shopOpen, setShopOpen] = useState(false)  // "Shop" accordion inside the drawer
  const [menu, setMenu] = useState(null)           // null | 'mega' | 'account'
  const [hovered, setHovered] = useState(null)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [featured, setFeatured] = useState(null)
  const headerRef = useRef(null)
  const timer = useRef(null)
  const { scrollY } = useScroll()

  // Hide the bar while scrolling down, bring it back when scrolling up
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    const hide = y > prev && y > 180
    setHidden(hide)
    setScrolled(y > 20)
    if (hide) setMenu(null)
  })

  // Close menus on navigation
  useEffect(() => { setMenu(null); setOpen(false) }, [pathname])

  // Close on Escape or when clicking outside the header
  useEffect(() => {
    if (!menu) return
    const onKey = (e) => e.key === 'Escape' && setMenu(null)
    const onDown = (e) => { if (!headerRef.current?.contains(e.target)) setMenu(null) }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown) }
  }, [menu])

  // Mobile drawer: lock the page behind it
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open])

  // The featured product in the Shop menu is loaded the first time the menu opens
  useEffect(() => {
    if (menu !== 'mega' || featured) return
    getProducts({ limit: 1 }).then((d) => setFeatured(d.products[0] || null)).catch(() => {})
  }, [menu, featured])

  const openMega = () => { clearTimeout(timer.current); if (hoverCapable()) setMenu('mega') }
  const closeMegaSoon = () => { clearTimeout(timer.current); timer.current = setTimeout(() => setMenu((m) => (m === 'mega' ? null : m)), 160) }
  const closeAll = () => { setMenu(null); setOpen(false) }

  const overHero = pathname === '/' && !scrolled && !open
  const solid = !!menu
  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase()

  return (
    <>
      <motion.header
        ref={headerRef}
        className={`nv ${scrolled ? 'scrolled' : ''} ${overHero ? 'over' : ''} ${solid ? 'solid' : ''}`}
        animate={{ y: hidden && !open ? '-100%' : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container nv-inner">
          <Link to="/" className="logo" onClick={closeAll}>Time<span>Nest</span></Link>

          <nav className="nv-links" aria-label="Main" onMouseLeave={() => setHovered(null)}>
            {NAV.map((n) => (
              <div
                key={n.key}
                className="nv-item"
                onMouseEnter={() => { setHovered(n.key); if (n.mega) openMega(); else closeMegaSoon() }}
                onMouseLeave={n.mega ? closeMegaSoon : undefined}
              >
                <NavLink to={n.to} className="nv-link" end={!n.mega} onClick={closeAll}>
                  {hovered === n.key && <motion.span layoutId="nv-pill" className="nv-pill" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                  <span>{n.label}</span>
                </NavLink>
                {n.mega && (
                  <button className="nv-chev" aria-label="Open the Shop menu" aria-expanded={menu === 'mega'} aria-controls="nv-mega"
                    onClick={() => setMenu((m) => (m === 'mega' ? null : 'mega'))}>
                    <FontAwesomeIcon icon={faChevronDown} />
                  </button>
                )}
              </div>
            ))}
          </nav>

          <div className="nv-actions">
            <SearchBox variant="nav" />

            <div className="nv-account">
              <button className={`icon-btn nv-avatar ${isLoggedIn ? 'in' : ''}`} aria-label="Account" aria-haspopup="menu" aria-expanded={menu === 'account'}
                onClick={() => setMenu((m) => (m === 'account' ? null : 'account'))}>
                {isLoggedIn ? <span>{initial}</span> : <FontAwesomeIcon icon={faUser} />}
              </button>
              <AnimatePresence>
                {menu === 'account' && (
                  <motion.div className="nv-pop" role="menu" {...pop}>
                    {isLoggedIn ? (
                      <>
                        <div className="nv-pop-head"><strong>{user?.name || 'Your account'}</strong><span>{user?.email}</span></div>
                        <Link to="/my-orders" role="menuitem" onClick={closeAll}><FontAwesomeIcon icon={faReceipt} /> My orders</Link>
                        <button role="menuitem" onClick={() => { logout(); closeAll() }}><FontAwesomeIcon icon={faRightFromBracket} /> Logout</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" role="menuitem" onClick={closeAll}>Login</Link>
                        <Link to="/signup" role="menuitem" onClick={closeAll}>Create account</Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="icon-btn cart-btn" onClick={() => { closeAll(); openDrawer() }} aria-label={`Open cart, ${count} items`}>
              <FontAwesomeIcon icon={faBagShopping} />
              {count > 0 && (
                <motion.span key={count} className="badge" initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
                  {count}
                </motion.span>
              )}
            </button>

            <button className="icon-btn nv-menu" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menu === 'mega' && (
            <motion.div id="nv-mega" className="nv-mega" {...pop} onMouseEnter={openMega} onMouseLeave={closeMegaSoon}>
              <div className="container nv-mega-grid">
                <div>
                  <p className="eyebrow">Collections</p>
                  <ul className="nv-cats">
                    {CATEGORIES.map((c, i) => (
                      <li key={c.slug}>
                        <Link to={`/category/${c.slug}`} onClick={closeAll}>
                          <span className="nv-num">0{i + 1}</span>
                          <span className="nv-cat-text"><strong>{c.name}</strong><small>{c.blurb}</small></span>
                          <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="nv-feature-wrap">
                  {featured ? (
                    <Link to={productPath(featured)} className="nv-feature" onClick={closeAll}>
                      {featured.image && <img src={optimizeImage(featured.image, 500)} alt={featured.name} />}
                      <span className="nv-feature-cap"><small>Featured</small><strong>{featured.name}</strong><em>{formatPrice(featured.price)}</em></span>
                    </Link>
                  ) : <div className="nv-feature skeleton" />}
                  <Link to="/shop" className="text-link" onClick={closeAll}>Shop all clocks →</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="drawer-overlay" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="drawer" role="dialog" aria-label="Menu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <div className="drawer-top">
                <span className="logo">Time<span>Nest</span></span>
                <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu"><FontAwesomeIcon icon={faXmark} /></button>
              </div>

              {isLoggedIn ? (
                <div className="drawer-user"><span className="nv-avatar in"><span>{initial}</span></span><div><strong>{user?.name}</strong><small>{user?.email}</small></div></div>
              ) : (
                <div className="drawer-auth">
                  <Link to="/login" className="btn btn-ghost" onClick={closeAll}>Login</Link>
                  <Link to="/signup" className="btn btn-gold" onClick={closeAll}>Sign up</Link>
                </div>
              )}

              <SearchBox variant="drawer" onDone={closeAll} />

              <motion.nav className="drawer-links" variants={listVariants} initial="closed" animate="open" aria-label="Mobile">
                <motion.div variants={itemVariants}>
                  <button className="drawer-acc" aria-expanded={shopOpen} onClick={() => setShopOpen(!shopOpen)}>
                    Shop <FontAwesomeIcon icon={faChevronDown} className={shopOpen ? 'flip' : ''} />
                  </button>
                  {shopOpen && (
                    <div className="drawer-sub">
                      <NavLink to="/shop" onClick={closeAll}>All clocks</NavLink>
                      {CATEGORIES.map((c) => <NavLink key={c.slug} to={`/category/${c.slug}`} onClick={closeAll}>{c.name}</NavLink>)}
                    </div>
                  )}
                </motion.div>
                {NAV.filter((n) => !n.mega).map((n) => (
                  <motion.div key={n.key} variants={itemVariants}>
                    <NavLink to={n.to} onClick={closeAll}>{n.label}<FontAwesomeIcon icon={faArrowRight} /></NavLink>
                  </motion.div>
                ))}
                {isLoggedIn && (
                  <motion.div variants={itemVariants}><NavLink to="/my-orders" onClick={closeAll}>My orders<FontAwesomeIcon icon={faArrowRight} /></NavLink></motion.div>
                )}
              </motion.nav>

              {isLoggedIn && <div className="drawer-foot"><button className="btn btn-ghost" onClick={() => { logout(); closeAll() }}>Logout</button></div>}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
