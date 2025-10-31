// lib/types.ts

export type ClientType = 'Individual' | 'Company';
export type ApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

// ===== Tambahan tipe produk (untuk Step 3/4) =====
export type PrintingMethod = 'Offset' | 'Digital' | 'Inkjet';
export type LaminationSide = 'Front' | 'Back' | 'Both';

export interface PaperOption {
  id: string;
  material: string;          
  gsm: number;
  supplier?: string;
  unit: "per_sheet" | "per_packet";
  cost: number;           
}

export interface ColorSide {
  front: 'CMYK' | '1C' | 'Pantone' | 'Custom';
  back: 'None' | 'SameAsFront' | 'CMYK' | '1C' | 'Pantone' | 'Custom';
}

export interface SizeSpec {
  flat: { widthCm: number; heightCm: number };
  close: { widthCm: number; heightCm: number };
}

export interface ClientInfo {
    clientType: "Company",
    companyName: string,
    contactPerson: string,
    email: string,
    emails: string[],
    phone: string,
    countryCode: "+971",
    role: string,
    address: string,
    city: string,
    area: string,
    state: string,
    postalCode: string,
    country: string,
    additionalInfo: string,
}

export interface Product {
  productName: string;
  quantity: number;
  printing: PrintingMethod;
  sides: 1 | 2;
  colors: ColorSide;
  size: SizeSpec;
  papers: PaperOption[];
  finishing: {
    embossing?: boolean;
    foiling?: boolean;
    folding?: boolean;
    dieCutting?: boolean;
    varnishing?: boolean;
    uvSpot?: boolean;
    lamination?: { enabled: boolean; side: LaminationSide; type?: 'Glossy' | 'Matte' | 'Velvet' };
  };
}

// ======== TYPE ASLI (dari kamu) ========
export interface OperationalPaper {
  inputWidth: number | null;
  inputHeight: number | null;
  pricePerPacket: number | null;
  pricePerSheet?: number | null;
  sheetsPerPacket: number | null;
  recommendedSheets: number;
  enteredSheets: number | null;
  outputWidth: number | null;
  outputHeight: number | null;
  selectedColors?: string[];
}

export interface FinishingCost {
  name: string;
  cost: number | null;
}

export interface DiscountApproval {
  approvedBy?: string;
  approvedAt?: Date;
  notes?: string;
}

export interface QuoteApproval {
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  approvalNotes?: string;
  requiresApproval: boolean;
  approvalReason?: string;
}

export interface QuoteDiscount {
  isApplied: boolean;
  percentage: number;
  amount: number;
  approval?: DiscountApproval;
}

export interface QuoteFormData {
  client: {
    clientType: 'Individual' | 'Company';
    companyName: string;
    contactPerson: string;
    firstName?: string;
    lastName?: string;
    email: string;
    emails?: string;          // JSON array of CC
    phone: string;
    countryCode: string;
    role: string;
    trn?: string;
    hasNoTrn?: boolean;
    address?: string;
    city?: string;
    area?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    additionalInfo?: string;
  };
  products: Product[];
  operational: {
    papers: OperationalPaper[];
    finishing: FinishingCost[];
    plates: number | null;
    units: number | null;
    impressions?: number | null;
  };
  calculation: {
    basePrice: number;
    marginAmount: number;
    marginPercentage: number;
    subtotal: number;
    discount?: QuoteDiscount;
    finalSubtotal: number;
    vatAmount: number;
    totalPrice: number;
  };
  approval?: QuoteApproval;
  salesPersonId?: string;
}

// ======== Tipe untuk "existing quote template" (list di Step-2) ========
export interface QuoteTemplate {
  id: string;           // e.g. "QT-2025-1004-729"
  status: 'Draft' | 'Pending' | 'Done';
  date: string;         // ISO date
  customerName: string; // untuk tabel
  clientSnapshot: QuoteFormData['client'];
  productsSnapshot: Product[]; // minimal index 0 dibuat sesuai contoh Business Card
  operationalSnapshot?: QuoteFormData['operational'];
  calculationSnapshot?: QuoteFormData['calculation'];
}

// ===== UI Transient state (mode & pilihan template) =====
export interface UIFlowState {
  mode: 'new' | 'existing';
  selectedExistingQuoteId?: string;
}
