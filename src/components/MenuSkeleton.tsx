export function MenuSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 animate-pulse">
            {/* Categories Sidebar/Header Skeleton */}
            <div className="hidden lg:block lg:col-span-1 mb-8">
                <div className="h-4 w-32 bg-zinc-200 rounded mb-4"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 w-full bg-zinc-200 rounded mb-2"></div>
                ))}
            </div>

            {/* Mobile Categories Skeleton */}
            <div className="lg:hidden flex gap-2 overflow-hidden mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-24 bg-zinc-200 rounded-full flex-shrink-0"></div>
                ))}
            </div>

            {/* Dishes Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-12">
                    {[1, 2].map((category) => (
                        <div key={category} className="mb-12">
                            <div className="mb-6">
                                <div className="h-8 w-48 bg-zinc-200 rounded mb-2"></div>
                                <div className="h-4 w-64 bg-zinc-200 rounded"></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((dish) => (
                                    <div key={dish} className="bg-white rounded-xl shadow-sm overflow-hidden h-64 border border-zinc-100">
                                        <div className="h-32 bg-zinc-200 w-full"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 w-3/4 bg-zinc-200 rounded"></div>
                                            <div className="h-3 w-full bg-zinc-200 rounded"></div>
                                            <div className="flex justify-between items-center pt-2">
                                                <div className="h-5 w-16 bg-zinc-200 rounded"></div>
                                                <div className="h-8 w-8 bg-zinc-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
