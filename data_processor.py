"""
Data Processor: Parse all Indian state Excel files into unified JSON.
Hierarchy: Country -> State -> District -> Sub-District -> Village
"""
import pandas as pd
import json
import os
import glob

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'dataset')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'backend', 'data')

# Standard column mapping
STD_COLS = {
    'MDDS STC': 'state_code',
    'STATE NAME': 'state_name',
    'MDDS DTC': 'district_code',
    'DISTRICT NAME': 'district_name',
    'MDDS Sub_DT': 'subdistrict_code',
    'SUB-DISTRICT NAME': 'subdistrict_name',
    'MDDS PLCN': 'village_code',
    'Area Name': 'area_name'
}

def process_mp_file(filepath):
    """Special handler for Madhya Pradesh (no headers, different format)."""
    df = pd.read_excel(filepath, header=None)
    # MP file: columns are state_code, district_code, subdistrict_code(?), unknown, area_name, unknown
    # Let's inspect and extract what we can
    rows = []
    state_name = "Madhya Pradesh"
    state_code = 23
    
    for _, row in df.iterrows():
        vals = row.tolist()
        # Skip NaN rows
        if pd.isna(vals[0]) and pd.isna(vals[4]):
            continue
        
        try:
            sc = int(vals[0]) if not pd.isna(vals[0]) else 0
        except:
            sc = 0
        try:
            dc = int(vals[1]) if not pd.isna(vals[1]) else 0
        except:
            dc = 0
        try:
            sdc_idx = int(vals[2]) if not pd.isna(vals[2]) else 0
        except:
            sdc_idx = 0
        try:
            sdc = int(vals[3]) if not pd.isna(vals[3]) else 0
        except:
            sdc = 0
        
        area = str(vals[4]).strip() if not pd.isna(vals[4]) else ''
        
        if area and sc == state_code:
            rows.append({
                'state_code': sc,
                'state_name': state_name,
                'district_code': dc,
                'district_name': '',
                'subdistrict_code': sdc,
                'subdistrict_name': '',
                'village_code': 0,
                'area_name': area
            })
    
    return pd.DataFrame(rows)

def process_all_files():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    seen_states = {}
    seen_districts = {}
    seen_subdistricts = {}
    all_villages = []
    
    sid_counter = 1
    did_counter = 1
    sdid_counter = 1
    vid_counter = 1
    
    files = sorted(glob.glob(os.path.join(DATA_DIR, 'Rdir_2011_*')))
    print(f"Found {len(files)} files to process...\n")
    
    for filepath in files:
        fname = os.path.basename(filepath)
        print(f"Processing: {fname}")
        
        try:
            # Special case: Madhya Pradesh
            if '23_MADHYA_PRADESH' in fname:
                print(f"  Skipping MP (non-standard format, will handle separately)")
                continue
            
            if filepath.endswith('.ods'):
                df = pd.read_excel(filepath, engine='odf')
            else:
                df = pd.read_excel(filepath)
            
            # Rename using standard mapping
            df = df.rename(columns=STD_COLS)
            
            current_state_key = None
            current_district_key = None
            current_sd_key = None
            
            for _, row in df.iterrows():
                state_code = int(row['state_code']) if not pd.isna(row['state_code']) else 0
                state_name = str(row['state_name']).strip() if not pd.isna(row['state_name']) else ''
                district_code = int(row['district_code']) if not pd.isna(row['district_code']) else 0
                district_name = str(row['district_name']).strip() if not pd.isna(row['district_name']) else ''
                sd_code = int(row['subdistrict_code']) if not pd.isna(row['subdistrict_code']) else 0
                sd_name = str(row['subdistrict_name']).strip() if not pd.isna(row['subdistrict_name']) else ''
                village_code = int(row['village_code']) if not pd.isna(row['village_code']) else 0
                area_name = str(row['area_name']).strip() if not pd.isna(row['area_name']) else ''
                
                # Normalize state name
                if state_name and state_name.isupper():
                    state_name = state_name.title()
                # Fix "And" -> "and" in state names
                state_name = state_name.replace(' And ', ' and ')
                
                # Track state
                if state_code != 0 and state_name:
                    sk = state_code
                    if sk not in seen_states:
                        seen_states[sk] = {
                            'id': sid_counter,
                            'name': state_name,
                            'code': state_code
                        }
                        sid_counter += 1
                    current_state_key = sk
                
                # Track district (district_code != 0 and it's a district-level row)
                if district_code != 0 and current_state_key is not None:
                    dk = (current_state_key, district_code)
                    if dk not in seen_districts and district_name:
                        seen_districts[dk] = {
                            'id': did_counter,
                            'name': district_name,
                            'code': district_code,
                            'state_id': seen_states[current_state_key]['id'],
                            'state_name': seen_states[current_state_key]['name']
                        }
                        did_counter += 1
                    if dk in seen_districts:
                        current_district_key = dk
                
                # Track sub-district
                if sd_code != 0 and current_district_key is not None:
                    sdk = (current_district_key, sd_code)
                    if sdk not in seen_subdistricts and sd_name:
                        dist = seen_districts[current_district_key]
                        seen_subdistricts[sdk] = {
                            'id': sdid_counter,
                            'name': sd_name,
                            'code': sd_code,
                            'district_id': dist['id'],
                            'district_name': dist['name'],
                            'state_id': seen_states[current_state_key]['id'],
                            'state_name': seen_states[current_state_key]['name']
                        }
                        sdid_counter += 1
                    if sdk in seen_subdistricts:
                        current_sd_key = sdk
                
                # Track village (village_code != 0 means it's a village row)
                if village_code != 0 and current_sd_key is not None and area_name:
                    sd = seen_subdistricts[current_sd_key]
                    village = {
                        'id': vid_counter,
                        'name': area_name,
                        'code': village_code,
                        'subdistrict_id': sd['id'],
                        'subdistrict_name': sd['name'],
                        'district_id': sd['district_id'],
                        'district_name': sd['district_name'],
                        'state_id': sd['state_id'],
                        'state_name': sd['state_name']
                    }
                    all_villages.append(village)
                    vid_counter += 1
            
            print(f"  OK - running total villages: {len(all_villages)}")
            
        except Exception as e:
            print(f"  ERROR: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    states_list = sorted(seen_states.values(), key=lambda x: x['id'])
    districts_list = sorted(seen_districts.values(), key=lambda x: x['id'])
    subdistricts_list = sorted(seen_subdistricts.values(), key=lambda x: x['id'])
    
    print(f"\n{'='*50}")
    print(f"RESULTS:")
    print(f"  States:        {len(states_list)}")
    print(f"  Districts:     {len(districts_list)}")
    print(f"  Sub-Districts: {len(subdistricts_list)}")
    print(f"  Villages:      {len(all_villages)}")
    print(f"{'='*50}")
    
    # Write JSON files
    with open(os.path.join(OUTPUT_DIR, 'states.json'), 'w', encoding='utf-8') as f:
        json.dump(states_list, f, ensure_ascii=False)
    print("Wrote states.json")
    
    with open(os.path.join(OUTPUT_DIR, 'districts.json'), 'w', encoding='utf-8') as f:
        json.dump(districts_list, f, ensure_ascii=False)
    print("Wrote districts.json")
    
    with open(os.path.join(OUTPUT_DIR, 'subdistricts.json'), 'w', encoding='utf-8') as f:
        json.dump(subdistricts_list, f, ensure_ascii=False)
    print("Wrote subdistricts.json")
    
    with open(os.path.join(OUTPUT_DIR, 'villages_all.json'), 'w', encoding='utf-8') as f:
        json.dump(all_villages, f, ensure_ascii=False)
    print("Wrote villages_all.json")
    
    # Split villages by state for faster loading
    os.makedirs(os.path.join(OUTPUT_DIR, 'villages'), exist_ok=True)
    villages_by_state = {}
    for v in all_villages:
        sid = v['state_id']
        if sid not in villages_by_state:
            villages_by_state[sid] = []
        villages_by_state[sid].append(v)
    
    for sid, vlist in villages_by_state.items():
        with open(os.path.join(OUTPUT_DIR, 'villages', f'state_{sid}.json'), 'w', encoding='utf-8') as f:
            json.dump(vlist, f, ensure_ascii=False)
    print(f"Wrote {len(villages_by_state)} state village files")
    
    # Summary
    summary = {
        'total_states': len(states_list),
        'total_districts': len(districts_list),
        'total_subdistricts': len(subdistricts_list),
        'total_villages': len(all_villages),
        'states': [{'id': s['id'], 'name': s['name'], 'code': s['code']} for s in states_list]
    }
    with open(os.path.join(OUTPUT_DIR, 'summary.json'), 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print("Wrote summary.json")
    
    print(f"\nAll data written to: {OUTPUT_DIR}")

if __name__ == '__main__':
    process_all_files()
