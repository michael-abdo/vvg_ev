# BEV Calculator Comparison & Update Plan

## Original Calculator Analysis (/calculator/original)

### Key Features:
1. **Two Vehicle Types**: Diesel vs Battery Electric Vehicle (BEV)
2. **Input Fields for Both Vehicles**:
   - Truck Cost
   - Infrastructure Cost  
   - Truck Incentive
   - Infrastructure Incentive
   - Residual Value
   - Fuel Price ($/gal for diesel, $/kWh for BEV)
   - Efficiency (MPG for diesel, kWh/mile for BEV)
   - Maintenance ($/mile)
   - Miles per Year

3. **LCFS Section**:
   - Enable/Disable checkbox
   - LCFS Credit Price ($/credit)
   - Energy Economy Ratio
   - Diesel CI (gCO2e/MJ)
   - Electricity CI (gCO2e/MJ)

4. **Results Display**:
   - Diesel Results Card (Fuel Cost/Mile, Operating Cost/Mile, Annual Operating Cost, Net Upfront Cost, 10-Year Total)
   - BEV Results Card (same metrics + LCFS Revenue if enabled)
   - 10-Year Cost Comparison Chart
   - Cost Savings Summary (10-Year Savings, Break-even Year)

5. **Additional Features**:
   - Prepared for/by fields at top
   - Collapsible sections for Diesel, BEV, and LCFS
   - Real-time calculation updates

---

## Competitor Page Analysis & Update Plans

### 1. Freightliner Page (/calculator/freightliner)

**Current Extra Features to Remove**:
- Company Name field
- Fleet Size field
- Vehicle Class dropdown (Class 4-8)
- Operation Type dropdown (Local Delivery, Regional Haul, etc.)
- Professional B2B fleet terminology

**UI Elements to Keep**:
- Dark professional header (bg-slate-900)
- Tabbed interface (Fleet Configuration, Vehicle Specifications, Cost Analysis, Financial Summary)
- Professional business styling
- Detailed financial results table
- Executive summary cards

**Update Plan**:
1. Remove Fleet Configuration tab entirely
2. Move Prepared for/by fields to header or first tab
3. In Vehicle Specifications tab:
   - Remove all vehicle class/operation type logic
   - Add all original calculator input fields for Diesel and BEV
4. Keep Cost Analysis tab with same chart
5. Keep Financial Summary tab with detailed table format
6. Add LCFS section to Vehicle Specifications or separate tab
7. Ensure all calculations use original calculator logic

---

### 2. Toyota Page (/calculator/toyota)

**Current Extra Features to Remove**:
- Vehicle type selection cards (Compact Car, Midsize Sedan, SUV, etc.)
- Step-by-step wizard flow
- Current vehicle selection
- Driving habits customization
- Home charging question
- Government incentives toggle
- Dynamic vehicle database lookup

**UI Elements to Keep**:
- Consumer-friendly design
- Progress steps visual
- Friendly iconography
- Clean card-based layout
- Savings celebration animations
- Mobile-responsive design

**Update Plan**:
1. Convert 4-step wizard to 3 sections:
   - Step 1: Vehicle Inputs (both Diesel and BEV fields)
   - Step 2: LCFS Settings
   - Step 3: Results & Savings
2. Remove all vehicle type cards and selection logic
3. Add all original calculator input fields
4. Keep the friendly design language but with original inputs
5. Maintain savings animations and celebratory UI
6. Keep progress indicator but adjust for new flow

---

### 3. MCCAC Page (/calculator/mccac)

**Current Extra Features to Remove**:
- State selection dropdown
- Regional incentive calculations
- Vehicle class cards (Compact, Midsize, SUV, Truck, Luxury)
- Environmental impact metrics (CO2 reduction, trees equivalent)
- State-specific electricity rates
- Educational tooltips about different vehicle types

**UI Elements to Keep**:
- Government/institutional design
- Blue color scheme
- Regional Resources section styling
- Educational tone
- Clear sectioned layout
- Incentive highlighting

**Update Plan**:
1. Remove state selection and vehicle class selection
2. Convert to standard input sections for Diesel and BEV
3. Keep educational cards but update content to explain TCO calculations
4. Maintain government styling and blue theme
5. Add LCFS section with educational explanation
6. Keep regional resources section but make it generic
7. Update environmental impact to show actual CO2 calculations from LCFS

---

### 4. Secoenergy Page (/calculator/secoenergy)

**Current Extra Features to Remove**:
- Vehicle year/brand/model dropdowns
- Gas vs EV vehicle selection
- Vehicle database lookup
- EV type selection (BEV/PHEV)
- Charging level selection
- Weekday/weekend driving pattern inputs
- Complex usage pattern calculations

**UI Elements to Keep**:
- Comprehensive 5-tab interface
- Utility company professional styling
- Detailed configuration options layout
- Data-rich presentation
- Technical terminology
- Comprehensive results display

**Update Plan**:
1. Restructure 5 tabs:
   - Tab 1: Diesel Vehicle Inputs
   - Tab 2: BEV Vehicle Inputs  
   - Tab 3: LCFS Configuration
   - Tab 4: Cost Analysis
   - Tab 5: Detailed Results
2. Remove all vehicle selection dropdowns
3. Add all original calculator input fields
4. Keep utility-focused professional design
5. Maintain comprehensive data display
6. Ensure LCFS calculations are prominently featured

---

## Implementation Priority

1. **Phase 1**: Update input fields to match original
   - Remove all custom vehicle selections
   - Add standard Diesel/BEV input fields
   - Ensure same field names and types

2. **Phase 2**: Update calculations
   - Use exact same calculation logic
   - Remove any custom calculation modifications
   - Ensure LCFS toggle works identically

3. **Phase 3**: Update results display
   - Show same metrics as original
   - Keep UI styling but show correct data
   - Ensure charts use same data structure

4. **Phase 4**: Testing
   - Verify all inputs update calculations
   - Test LCFS enable/disable
   - Confirm results match original calculator
   - Test responsive design