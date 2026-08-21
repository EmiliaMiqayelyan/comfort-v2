import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest, type AuthUser } from "@/lib/api";
import type { ConfiguratorState, VisualizerState, CalculatorInput, CalculatorResult } from "@/types";

interface UiState {
  mobileNavOpen: boolean;
  searchOpen: boolean;
  loadingScreen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setLoadingScreen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  searchOpen: false,
  loadingScreen: true,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setLoadingScreen: (loadingScreen) => set({ loadingScreen }),
}));

interface ConfiguratorStore extends ConfiguratorState {
  setField: <K extends keyof ConfiguratorState>(key: K, value: ConfiguratorState[K]) => void;
  toggleCorner: (id: string) => void;
  toggleConnector: (id: string) => void;
  reset: () => void;
}

const initialConfigurator: ConfiguratorState = {
  collectionId: null,
  modelId: null,
  colorId: null,
  finishId: "matte",
  materialId: "hd-polymer",
  textureId: null,
  ledProfile: false,
  cornerAccessories: [],
  connectors: [],
};

export const useConfiguratorStore = create<ConfiguratorStore>((set) => ({
  ...initialConfigurator,
  setField: (key, value) => set({ [key]: value }),
  toggleCorner: (id) =>
    set((state) => ({
      cornerAccessories: state.cornerAccessories.includes(id)
        ? state.cornerAccessories.filter((c) => c !== id)
        : [...state.cornerAccessories, id],
    })),
  toggleConnector: (id) =>
    set((state) => ({
      connectors: state.connectors.includes(id)
        ? state.connectors.filter((c) => c !== id)
        : [...state.connectors, id],
    })),
  reset: () => set(initialConfigurator),
}));

interface VisualizerStore extends VisualizerState {
  setField: <K extends keyof VisualizerState>(key: K, value: VisualizerState[K]) => void;
  reset: () => void;
}

const initialVisualizer: VisualizerState = {
  roomImage: null,
  presetId: "living-warm",
  baseboardId: null,
  panelId: null,
  moldingId: null,
  wallColor: "#E7DFD9",
  floorId: "oak",
  lighting: "day",
  showBefore: false,
};

export const useVisualizerStore = create<VisualizerStore>((set) => ({
  ...initialVisualizer,
  setField: (key, value) => set({ [key]: value }),
  reset: () => set(initialVisualizer),
}));

interface CalculatorStore {
  input: CalculatorInput;
  result: CalculatorResult | null;
  setInput: <K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) => void;
  setResult: (result: CalculatorResult | null) => void;
}

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  input: {
    perimeter: 40,
    wallHeight: 2.7,
    doorCount: 2,
    windowCount: 3,
    profileType: "",
    cornerType: "standard",
    includeAdhesive: true,
    wastePercent: 8,
  },
  result: null,
  setInput: (key, value) =>
    set((state) => ({ input: { ...state.input, [key]: value } })),
  setResult: (result) => set({ result }),
}));

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email, password) => {
        try {
          const { token, user } = await loginRequest(email, password);
          set({ user, token });
          return true;
        } catch {
          return false;
        }
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: "comfort-auth" },
  ),
);

interface ViewerState {
  autoRotate: boolean;
  exploded: boolean;
  wireframe: boolean;
  showDimensions: boolean;
  color: string;
  material: "standard" | "physical" | "matte";
  lighting: "studio" | "soft" | "dramatic" | "product";
  environment: "apartment" | "city" | "warehouse" | "sunset";
  set: (partial: Partial<ViewerState>) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  autoRotate: true,
  exploded: false,
  wireframe: false,
  showDimensions: true,
  color: "#E7DFD9",
  material: "physical",
  lighting: "studio",
  environment: "apartment",
  set: (partial) => set(partial),
}));
