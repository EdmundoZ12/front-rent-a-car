import { Component, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',   icon: 'dashboard',      route: '/dashboard' },
  { id: 'contratos',  label: 'Contratos',   icon: 'description',    route: '/contratos', badge: 0 },
  { id: 'vehiculos',  label: 'Vehículos',   icon: 'directions_car', route: '/vehiculos' },
  { id: 'clientes',   label: 'Clientes',    icon: 'people',         route: '/clientes' },
  { id: 'tarifas',    label: 'Tarifas',     icon: 'sell',           route: '/tarifas' },
  { id: 'coberturas', label: 'Coberturas',  icon: 'shield',         route: '/coberturas' },
];

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, RouterLink],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L3 19h16L11 2z" fill="#0A0A0A"/>
            <path d="M8 14h6M9.5 10.5h3" stroke="#0A0A0A" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="logo-text">
          <div class="logo-name">ACROSS</div>
          <div class="logo-sub">RENT-A-CAR</div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        @for (item of navItems; track item.id) {
          <a
            [routerLink]="item.route"
            class="nav-item"
            [ngClass]="{ 'nav-item--active': isActive(item.route) }"
          >
            <span class="material-icons nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
            @if (item.badge) {
              <span class="nav-badge">{{ item.badge }}</span>
            }
          </a>
        }
      </nav>

      <!-- User footer -->
      <div class="sidebar-user">
        <div class="user-avatar">AD</div>
        <div class="user-info">
          <div class="user-name">Administrador</div>
          <div class="user-email">admin&#64;across.com</div>
        </div>
        <span class="material-icons user-more">more_vert</span>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background: var(--color-sidebar);
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
      display: flex;
      flex-direction: column;
    }

    /* Logo */
    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 18px 18px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    .logo-icon {
      width: 38px; height: 38px;
      background: var(--color-accent);
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .logo-name {
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 1.2px;
      line-height: 1;
    }
    .logo-sub {
      color: rgba(255,255,255,0.38);
      font-size: 10px;
      letter-spacing: 1.5px;
      margin-top: 2px;
    }

    /* Nav */
    .sidebar-nav {
      flex: 1;
      padding: 8px 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 18px 11px 15px;
      border-left: 3px solid transparent;
      color: rgba(255,255,255,0.6);
      font-size: 13.5px;
      font-weight: 400;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.85);
    }
    .nav-item--active {
      border-left-color: var(--color-accent) !important;
      background: rgba(245,192,0,0.09) !important;
      color: var(--color-accent) !important;
      font-weight: 500;
    }
    .nav-icon {
      font-size: 19px;
      opacity: 0.75;
    }
    .nav-item--active .nav-icon { opacity: 1; }
    .nav-label { flex: 1; }
    .nav-badge {
      background: var(--color-accent);
      color: var(--color-ink);
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      line-height: 16px;
    }

    /* User footer */
    .sidebar-user {
      border-top: 1px solid rgba(255,255,255,0.07);
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .user-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      background: rgba(245,192,0,0.18);
      display: flex; align-items: center; justify-content: center;
      color: var(--color-accent);
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .user-name {
      color: #fff;
      font-size: 12.5px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      color: rgba(255,255,255,0.35);
      font-size: 11px;
      margin-top: 1px;
    }
    .user-info { min-width: 0; flex: 1; }
    .user-more {
      color: rgba(255,255,255,0.3);
      font-size: 18px;
      cursor: pointer;
      flex-shrink: 0;
    }
  `],
})
export class SidebarComponent {
  readonly navItems = NAV_ITEMS;

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
