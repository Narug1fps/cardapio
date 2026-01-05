'use client'

interface MenuHeaderProps {
    restaurantName?: string
    logoUrl?: string
}

export function MenuHeader({ restaurantName = 'Nosso Restaurante', logoUrl }: MenuHeaderProps) {
    return (
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--menu-bg)]/80 border-b border-white/5 transition-colors duration-300">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={restaurantName}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                    ) : (
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                            style={{
                                background: 'linear-gradient(to bottom right, var(--menu-primary, #f59e0b), var(--menu-secondary, #ea580c))'
                            }}
                        >
                            <span className="text-white font-bold text-lg">
                                {restaurantName.charAt(0)}
                            </span>
                        </div>
                    )}
                    <h1
                        className="text-xl md:text-2xl font-bold bg-clip-text text-transparent"
                        style={{
                            backgroundImage: 'linear-gradient(to right, var(--menu-primary, #f59e0b), var(--menu-secondary, #ea580c))',
                            color: 'transparent'
                        }}
                    >
                        {restaurantName}
                    </h1>
                </div>
            </div>
        </header>
    )
}
