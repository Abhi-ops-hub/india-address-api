const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function loadData(app) {
  console.log('Loading geographical data into memory...');
  const start = Date.now();

  try {
    const states = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'states.json'), 'utf-8'));
    const districts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'districts.json'), 'utf-8'));
    const subdistricts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'subdistricts.json'), 'utf-8'));

    // Load all village files
    const villagesDir = path.join(DATA_DIR, 'villages');
    const villageFiles = fs.readdirSync(villagesDir).filter(f => f.endsWith('.json'));
    let allVillages = [];
    const villagesByState = {};

    for (const vf of villageFiles) {
      const stateVillages = JSON.parse(fs.readFileSync(path.join(villagesDir, vf), 'utf-8'));
      const stateId = parseInt(vf.replace('state_', '').replace('.json', ''));
      villagesByState[stateId] = stateVillages;
      allVillages = allVillages.concat(stateVillages);
    }

    // Build lookup indexes for fast queries
    const stateByCode = {};
    const stateById = {};
    for (const s of states) {
      stateByCode[s.code] = s;
      stateById[s.id] = s;
    }

    const districtsByState = {};
    const districtById = {};
    for (const d of districts) {
      if (!districtsByState[d.state_id]) districtsByState[d.state_id] = [];
      districtsByState[d.state_id].push(d);
      districtById[d.id] = d;
    }

    const subdistrictsByDistrict = {};
    const subdistrictById = {};
    for (const sd of subdistricts) {
      if (!subdistrictsByDistrict[sd.district_id]) subdistrictsByDistrict[sd.district_id] = [];
      subdistrictsByDistrict[sd.district_id].push(sd);
      subdistrictById[sd.id] = sd;
    }

    const villagesBySubdistrict = {};
    for (const v of allVillages) {
      if (!villagesBySubdistrict[v.subdistrict_id]) villagesBySubdistrict[v.subdistrict_id] = [];
      villagesBySubdistrict[v.subdistrict_id].push(v);
    }

    // Build search index (name -> entries) for autocomplete
    const searchIndex = [];
    for (const v of allVillages) {
      searchIndex.push({
        name: v.name,
        type: 'village',
        full: `${v.name}, ${v.subdistrict_name}, ${v.district_name}, ${v.state_name}`,
        data: v
      });
    }

    app.locals.geoData = {
      states,
      districts,
      subdistricts,
      totalVillages: allVillages.length,
      stateByCode,
      stateById,
      districtsByState,
      districtById,
      subdistrictsByDistrict,
      subdistrictById,
      villagesByState,
      villagesBySubdistrict,
      searchIndex
    };

    const elapsed = Date.now() - start;
    console.log(`✅ Data loaded in ${elapsed}ms`);
    console.log(`   ${states.length} states, ${districts.length} districts, ${subdistricts.length} sub-districts, ${allVillages.length} villages`);
  } catch (err) {
    console.error('❌ Error loading data:', err.message);
    app.locals.geoData = {
      states: [], districts: [], subdistricts: [],
      totalVillages: 0,
      stateByCode: {}, stateById: {},
      districtsByState: {}, districtById: {},
      subdistrictsByDistrict: {}, subdistrictById: {},
      villagesByState: {}, villagesBySubdistrict: {},
      searchIndex: []
    };
  }
}

module.exports = { loadData };
