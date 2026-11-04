import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
    Gauge,
    KeyRound,
    LayoutGrid,
    Settings,
    ShieldCheck,
    User as UserIcon,
    Users,
} from 'lucide-react';

import { ConsoleShell } from '@euler/console-kit/layout';
import type { CurrentUser, MenuItem } from '@euler/console-kit/layout';

import { Brand, ShieldLock } from '@/icons';
import { consoleI18n } from '../i18n';
import LogoutConfirmModal from './LogoutConfirmModal';

/**
 * Admin console nav tree. Icons are Lucide components so they inherit
 * `currentColor` from the sidebar and shrink gracefully in icon-collapsed
 * mode. Labels are i18n keys resolved against this app's `nav.*` bundle.
 */
const buildMenuItems = (t: TFunction): MenuItem[] => [
    { key: '/dashboard', icon: Gauge, label: t('nav.dashboard'), to: '/dashboard' },
    {
        key: 'identity',
        icon: Users,
        label: t('nav.iam'),
        children: [
            { key: '/users', icon: UserIcon, label: t('nav.user'), to: '/users' },
            { key: '/roles', icon: ShieldCheck, label: t('nav.role'), to: '/roles' },
        ],
    },
    {
        key: 'oauth2',
        icon: ShieldLock,
        label: t('nav.oauth2'),
        children: [
            { key: '/oauth2/clients', icon: LayoutGrid, label: t('nav.oauth2_client'), to: '/oauth2/clients' },
            { key: '/oauth2/jwks', icon: KeyRound, label: t('nav.oauth2_jwk'), to: '/oauth2/jwks' },
        ],
    },
    { key: '/settings', icon: Settings, label: t('nav.settings'), to: '/settings' },
];

/**
 * ConsoleLayout — the user-center admin wiring around the shared
 * `ConsoleShell` chrome (@euler/console-kit). Everything project-specific
 * lives here, so the shell stays reusable:
 *   - the nav tree (buildMenuItems, from i18n `nav.*`),
 *   - the brand icon + fallback site name (a `<meta name="site-name">` tag,
 *     injected by the backend Thymeleaf template, overrides the fallback),
 *   - the current principal, fetched once from `/user`, and
 *   - the logout dialog — admin uses the Spring Security form + CSRF flow
 *     (see LogoutConfirmModal), passed through the shell's `logoutDialog` slot.
 *
 * Mounted directly by the route table (see router.tsx) as the console layout.
 */
const ConsoleLayout = (): ReactElement => {
    const { t, i18n } = useTranslation();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    // Only the first mount shows a skeleton; once loaded-but-unauthenticated
    // the footer falls back to static text instead of pulsing forever.
    const [userLoading, setUserLoading] = useState(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const menuItems = useMemo(() => buildMenuItems(t), [t, i18n.language]);

    // Fetch the current principal once on mount. `/user` returns the
    // credential-erased EulerUserDetails; username feeds the sidebar footer.
    useEffect(() => {
        let cancelled = false;
        fetch('/user', { headers: { Accept: 'application/json' } })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (cancelled) return;
                if (data) setCurrentUser(data);
                setUserLoading(false);
            })
            .catch(() => {
                /* keep currentUser null; footer falls back to a blank avatar */
                if (!cancelled) setUserLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <ConsoleShell
            menuItems={menuItems}
            brand={<Brand className="size-4" />}
            siteName="User Center"
            homeTo="/"
            currentUser={currentUser}
            userLoading={userLoading}
            consoleI18n={consoleI18n}
            logoutDialog={({ open, onCancel }) => (
                <LogoutConfirmModal open={open} onCancel={onCancel} />
            )}
        />
    );
};

export default ConsoleLayout;
