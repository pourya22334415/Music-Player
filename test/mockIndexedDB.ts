import { vi } from "vitest";


(globalThis as any).indexedDB = {
    open: vi.fn().mockReturnValue({
        onsuccess: null,
        onupgradeneeded: null,
        result: {
            transaction: vi.fn().mockReturnValue({
                objectStore: vi.fn().mockReturnValue({
                    getAll: vi.fn().mockReturnValue({
                        onsuccess: null,
                        onerror: null
                    }),
                    get: vi.fn().mockReturnValue({
                        onsuccess: null,
                        onerror: null
                    }),
                    put: vi.fn().mockReturnValue({
                        onsuccess: null,
                        onerror: null
                    })
                })
            })
        }
    })
};  
