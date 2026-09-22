(function(){
  "use strict";

  /* ============ equipment ============ */
  var EQUIP = [
    { id:"barbell",    name:"Barbell &amp; plates", note:"Bench press, RDLs, squats, hip thrusts" },
    { id:"dumbbell",   name:"Dumbbells",            note:"The backbone of most substitutions" },
    { id:"kettlebell", name:"Kettlebells",          note:"Goblet squats, swings, carries, presses" },
    { id:"cable",      name:"Cable station",        note:"Pulldowns, rows, pushdowns, face pulls" },
    { id:"machine",    name:"Selectorized machines",note:"Leg press, leg curl, pec deck, machine rows" },
    { id:"smith",      name:"Smith machine",        note:"Guided squats, presses, split squats" },
    { id:"bands",      name:"Resistance bands",     note:"Light pulling and isolation work" },
    { id:"bench",      name:"Adjustable bench",     note:"Needed for incline, supported and hip-thrust work" },
    { id:"bar",        name:"Pull-up bar",          note:"Pull-ups, chin-ups, hanging knee raises" }
  ];
  var DEFAULT_EQ = {
    barbell:true, dumbbell:true, kettlebell:true, cable:true,
    machine:false, smith:false, bands:false, bench:true, bar:true
  };
  var EQ_LABEL = {
    barbell:"Barbell", dumbbell:"Dumbbell", kettlebell:"Kettlebell", cable:"Cable",
    machine:"Machine", smith:"Smith", bands:"Band", bench:"Bench", bar:"Bar", body:"Bodyweight"
  };

  /* ============ shared option pools ============ */
  function o(id, name, eq, extra){
    var x = { id:id, name:name, eq:eq };
    if(extra){ for(var k in extra){ x[k] = extra[k]; } }
    return x;
  }

  var SIDE_DELT = [
    o("db-lat",   "Dumbbell Lateral Raise", ["dumbbell"]),
    o("cbl-lat",  "Cable Lateral Raise", ["cable"]),
    o("kb-lat",   "Kettlebell Lateral Raise", ["kettlebell"]),
    o("mch-lat",  "Machine Lateral Raise", ["machine"]),
    o("bnd-lat",  "Band Lateral Raise", ["bands"]),
    o("bw-lat",   "Leaning Partial Raise (light plate)", ["barbell"])
  ];
  var REAR_DELT = [
    o("cbl-face", "Face Pull", ["cable"]),
    o("mch-rear", "Reverse Pec Deck", ["machine"]),
    o("db-rear",  "Bent-Over Dumbbell Reverse Fly", ["dumbbell"]),
    o("kb-rear",  "Kettlebell Reverse Fly", ["kettlebell"]),
    o("bnd-apart","Band Pull-Apart", ["bands"]),
    o("bw-ytw",   "Prone Y-T-W Raise", [], { bw:true })
  ];
  var HAM_CURL = [
    o("mch-scurl","Seated Leg Curl", ["machine"]),
    o("mch-lcurl","Lying Leg Curl", ["machine"]),
    o("bw-slider","Slider Hamstring Curl", [], { bw:true }),
    o("bnd-curl", "Band Leg Curl", ["bands"]),
    o("kb-swing-l","Kettlebell Swing", ["kettlebell"], { lo:12, hi:20 }),
    o("bw-nordic","Assisted Nordic Curl", [], { bw:true })
  ];
  var CALF = [
    o("mch-scalf","Standing Calf Raise (machine)", ["machine"]),
    o("mch-seat", "Seated Calf Raise (machine)", ["machine"]),
    o("db-calf",  "Single-Leg Dumbbell Calf Raise", ["dumbbell"], { perLeg:true }),
    o("kb-calf",  "Kettlebell Calf Raise", ["kettlebell"]),
    o("sm-calf",  "Smith Machine Calf Raise", ["smith"]),
    o("bb-calf",  "Barbell Calf Raise", ["barbell"]),
    o("bw-calf",  "Bodyweight Calf Raise off a Step", [], { bw:true, lo:15, hi:25 })
  ];
  var TRI_MAIN = [
    o("cbl-rope", "Rope Triceps Pushdown", ["cable"]),
    o("cbl-bar",  "Straight-Bar Pushdown", ["cable"]),
    o("db-skull", "Dumbbell Skull Crusher", ["dumbbell","bench"]),
    o("bb-cgbp",  "Close-Grip Bench Press", ["barbell","bench"]),
    o("kb-floor-tri","Kettlebell Floor Skull Crusher", ["kettlebell"]),
    o("bw-dip",   "Bench Dip", [], { bw:true, lo:10, hi:20 })
  ];
  var BICEP = [
    o("db-curl",  "Dumbbell Curl", ["dumbbell"]),
    o("bb-curl",  "Barbell or EZ-Bar Curl", ["barbell"]),
    o("kb-curl",  "Kettlebell Curl", ["kettlebell"]),
    o("cbl-curl", "Cable Curl", ["cable"]),
    o("db-inc-curl","Incline Dumbbell Curl", ["dumbbell","bench"]),
    o("bw-chin",  "Chin-Up", ["bar"], { bw:true, lo:5, hi:10 }),
    o("bnd-curl", "Band Curl", ["bands"])
  ];
  var ABS = [
    o("cbl-crunch","Cable Crunch", ["cable"]),
    o("kb-crunch", "Weighted Kettlebell Crunch", ["kettlebell"]),
    o("mch-crunch","Machine Crunch", ["machine"]),
    o("bar-knee",  "Hanging Knee Raise", ["bar"], { bw:true }),
    o("bw-legraise","Lying Leg Raise", [], { bw:true, lo:12, hi:20 }),
    o("bnd-crunch","Band Crunch", ["bands"])
  ];

  /* ============ the plan: slots, not fixed exercises ============ */
  var PLAN = [
    { id:"push", num:"01", name:"Push", day:"Monday", muscles:"Chest &middot; Shoulders &middot; Triceps",
      coach:"Open the week with the biggest press you can do with clean technique. Everything after it is support work.",
      slots:[
        { id:"p1", role:"Primary chest press", sets:3, lo:6, hi:10, opts:[
          o("bb-bench",  "Barbell Bench Press", ["barbell","bench"]),
          o("mch-press", "Machine Chest Press", ["machine"]),
          o("db-bench",  "Flat Dumbbell Press", ["dumbbell","bench"]),
          o("sm-bench",  "Smith Machine Bench Press", ["smith","bench"]),
          o("kb-floor",  "Kettlebell Floor Press", ["kettlebell"]),
          o("bw-pushup", "Weighted Push-Up", [], { lo:10, hi:20 })
        ]},
        { id:"p2", role:"Upper chest", sets:3, lo:8, hi:12, opts:[
          o("db-incline","Incline Dumbbell Press", ["dumbbell","bench"]),
          o("bb-incline","Incline Barbell Press", ["barbell","bench"]),
          o("mch-incline","Incline Machine Press", ["machine"]),
          o("sm-incline","Incline Smith Press", ["smith","bench"]),
          o("cbl-lowhigh","Low-to-High Cable Fly", ["cable"], { lo:10, hi:15 }),
          o("bw-decline-pu","Feet-Elevated Push-Up", [], { bw:true, lo:10, hi:20 })
        ]},
        { id:"p3", role:"Shoulder press", sets:2, lo:8, hi:12, opts:[
          o("db-ohp",   "Seated Dumbbell Shoulder Press", ["dumbbell","bench"]),
          o("kb-ohp",   "Standing Kettlebell Overhead Press", ["kettlebell"]),
          o("mch-ohp",  "Machine Shoulder Press", ["machine"]),
          o("bb-ohp",   "Standing Barbell Overhead Press", ["barbell"]),
          o("kb-halfk", "Half-Kneeling Kettlebell Press", ["kettlebell"], { perLeg:true }),
          o("sm-ohp",   "Smith Machine Shoulder Press", ["smith"])
        ]},
        { id:"p4", role:"Side delts", sets:3, lo:12, hi:15, opts:SIDE_DELT },
        { id:"p5", role:"Chest isolation", sets:2, lo:10, hi:15, opts:[
          o("mch-pec",  "Pec Deck", ["machine"]),
          o("cbl-fly",  "Cable Fly", ["cable"]),
          o("db-fly",   "Dumbbell Fly", ["dumbbell","bench"]),
          o("bnd-fly",  "Band Chest Fly", ["bands"]),
          o("bw-deficit","Deficit Push-Up", [], { bw:true, lo:10, hi:20 })
        ]},
        { id:"p6", role:"Triceps", sets:3, lo:10, hi:15, opts:TRI_MAIN },
        { id:"p7", role:"Triceps long head", sets:2, lo:10, hi:15, opts:[
          o("cbl-oh",   "Overhead Cable Extension", ["cable"]),
          o("db-oh",    "Overhead Dumbbell Extension", ["dumbbell"]),
          o("kb-oh",    "Overhead Kettlebell Extension", ["kettlebell"]),
          o("bnd-oh",   "Band Overhead Extension", ["bands"]),
          o("bw-oh-dip","Deep Bench Dip", ["bench"], { bw:true, lo:10, hi:20 })
        ]}
      ]},

    { id:"pull", num:"02", name:"Pull", day:"Tuesday", muscles:"Back &middot; Rear delts &middot; Biceps",
      coach:"Chest-supported rows on purpose &mdash; all the back stimulus, none of the lower-back tax while you're getting conditioned again.",
      slots:[
        { id:"u1", role:"Vertical pull", sets:3, lo:8, hi:12, opts:[
          o("cbl-pulldown","Lat Pulldown", ["cable"]),
          o("bar-pullup",  "Pull-Up or Assisted Pull-Up", ["bar"], { bw:true, lo:5, hi:10 }),
          o("db-pullover", "Single-Arm Dumbbell Pullover", ["dumbbell","bench"]),
          o("kb-pullover", "Kettlebell Pullover", ["kettlebell","bench"]),
          o("bnd-pulldown","Band Lat Pulldown", ["bands"])
        ]},
        { id:"u2", role:"Supported row", sets:3, lo:8, hi:12, opts:[
          o("db-csrow", "Chest-Supported Dumbbell Row", ["dumbbell","bench"]),
          o("mch-csrow","Chest-Supported Machine Row", ["machine"]),
          o("kb-csrow", "Chest-Supported Kettlebell Row", ["kettlebell","bench"]),
          o("bb-seal",  "Seal Row", ["barbell","bench"]),
          o("bw-inv",   "Inverted Row", [], { bw:true, lo:8, hi:15 })
        ]},
        { id:"u3", role:"Second row", sets:2, lo:10, hi:12, opts:[
          o("cbl-row",  "Seated Cable Row", ["cable"]),
          o("db-1arm",  "Single-Arm Dumbbell Row", ["dumbbell","bench"], { perLeg:true }),
          o("kb-1arm",  "Single-Arm Kettlebell Row", ["kettlebell","bench"], { perLeg:true }),
          o("bb-row",   "Bent-Over Barbell Row", ["barbell"]),
          o("bnd-row",  "Band Seated Row", ["bands"])
        ]},
        { id:"u4", role:"Rear delts", sets:3, lo:12, hi:15, opts:REAR_DELT },
        { id:"u5", role:"Biceps", sets:3, lo:8, hi:12, opts:BICEP },
        { id:"u6", role:"Brachialis", sets:2, lo:10, hi:15, opts:[
          o("db-hammer", "Hammer Curl", ["dumbbell"]),
          o("cbl-hammer","Rope Hammer Curl", ["cable"]),
          o("kb-hammer", "Kettlebell Hammer Curl", ["kettlebell"]),
          o("db-cross",  "Cross-Body Hammer Curl", ["dumbbell"], { perLeg:true }),
          o("bnd-hammer","Band Hammer Curl", ["bands"])
        ]},
        { id:"u7", role:"Erectors (optional)", sets:2, lo:10, hi:15, opts:[
          o("mch-backext","Back Extension", ["machine"]),
          o("kb-swing",   "Kettlebell Swing", ["kettlebell"], { lo:12, hi:20 }),
          o("bb-gm",      "Barbell Good Morning", ["barbell"]),
          o("bw-birddog", "Bird Dog", [], { bw:true, lo:8, hi:12, perLeg:true }),
          o("bw-hyper",   "Bench Reverse Hyper", ["bench"], { bw:true, lo:12, hi:20 })
        ]}
      ]},

    { id:"legs", num:"03", name:"Legs", day:"Wednesday", muscles:"Quads &middot; Hams &middot; Glutes &middot; Calves &middot; Core",
      coach:"Lead with a squat pattern you can control. Plenty of stimulus, far less technique fatigue after a layoff.",
      slots:[
        { id:"l1", role:"Primary squat pattern", sets:3, lo:8, hi:12, opts:[
          o("mch-legpress","Leg Press", ["machine"]),
          o("mch-hack",    "Hack Squat", ["machine"]),
          o("kb-goblet",   "Goblet Squat", ["kettlebell"]),
          o("bb-squat",    "Barbell Back Squat", ["barbell"]),
          o("db-frontsq",  "Dumbbell Front-Rack Squat", ["dumbbell"]),
          o("sm-squat",    "Smith Machine Squat", ["smith"])
        ]},
        { id:"l2", role:"Hip hinge", sets:3, lo:8, hi:10, opts:[
          o("bb-rdl",  "Romanian Deadlift", ["barbell"]),
          o("db-rdl",  "Dumbbell RDL", ["dumbbell"]),
          o("kb-rdl",  "Kettlebell RDL", ["kettlebell"]),
          o("kb-slrdl","Single-Leg Kettlebell RDL", ["kettlebell"], { perLeg:true }),
          o("sm-rdl",  "Smith Machine RDL", ["smith"])
        ]},
        { id:"l3", role:"Quad isolation", sets:2, lo:10, hi:15, opts:[
          o("mch-ext",   "Leg Extension", ["machine"]),
          o("kb-cyclist","Heels-Elevated Goblet Squat", ["kettlebell"]),
          o("bw-sissy",  "Sissy Squat", [], { bw:true }),
          o("bw-nordrev","Reverse Nordic Curl", [], { bw:true }),
          o("bnd-ext",   "Band Leg Extension", ["bands"])
        ]},
        { id:"l4", role:"Hamstring curl", sets:3, lo:10, hi:15, opts:HAM_CURL },
        { id:"l5", role:"Unilateral", sets:2, lo:8, hi:10, perLeg:true, opts:[
          o("db-lunge",  "Dumbbell Walking Lunge", ["dumbbell"], { perLeg:true }),
          o("kb-revlunge","Kettlebell Reverse Lunge", ["kettlebell"], { perLeg:true }),
          o("bb-lunge",  "Barbell Walking Lunge", ["barbell"], { perLeg:true }),
          o("db-stepup", "Dumbbell Step-Up", ["dumbbell","bench"], { perLeg:true }),
          o("bw-revlunge","Bodyweight Reverse Lunge", [], { bw:true, perLeg:true, lo:12, hi:20 })
        ]},
        { id:"l6", role:"Calves", sets:3, lo:10, hi:15, opts:CALF },
        { id:"l7", role:"Loaded abs", sets:3, lo:10, hi:15, opts:ABS },
        { id:"l8", role:"Core hold", sets:2, lo:30, hi:60, time:true, opts:[
          o("bw-plank",  "Plank", [], { bw:true, time:true }),
          o("bw-side",   "Side Plank", [], { bw:true, time:true, perLeg:true }),
          o("bw-hollow", "Hollow Hold", [], { bw:true, time:true }),
          o("kb-rackhold","Kettlebell Front-Rack Hold", ["kettlebell"], { time:true }),
          o("bw-deadbug","Dead Bug", [], { bw:true, time:true })
        ]}
      ]},

    { id:"upper", num:"04", name:"Upper", day:"Friday", muscles:"Chest &middot; Back &middot; Shoulders &middot; Arms",
      coach:"Second dose for everything up top. The app deliberately picks different movements from Monday and Tuesday where it can.",
      slots:[
        { id:"v1", role:"Incline press", sets:3, lo:8, hi:12, opts:[
          o("mch-incline2","Incline Machine Press", ["machine"]),
          o("bb-incline2", "Incline Barbell Press", ["barbell","bench"]),
          o("db-incline2", "Incline Dumbbell Press", ["dumbbell","bench"]),
          o("sm-incline2", "Incline Smith Press", ["smith","bench"]),
          o("kb-incpress", "Incline Kettlebell Press", ["kettlebell","bench"])
        ]},
        { id:"v2", role:"Neutral-grip pull", sets:3, lo:8, hi:12, opts:[
          o("cbl-ngpull","Neutral-Grip Lat Pulldown", ["cable"]),
          o("bar-ngpull","Neutral-Grip Pull-Up", ["bar"], { bw:true, lo:5, hi:10 }),
          o("db-pullover2","Dumbbell Pullover", ["dumbbell","bench"]),
          o("kb-pullover2","Kettlebell Pullover", ["kettlebell","bench"]),
          o("bnd-ngpull","Band Neutral-Grip Pulldown", ["bands"])
        ]},
        { id:"v3", role:"Row", sets:3, lo:8, hi:12, opts:[
          o("mch-row2","Machine Row", ["machine"]),
          o("cbl-row2","Cable Row", ["cable"]),
          o("kb-bor",  "Bent-Over Kettlebell Row", ["kettlebell"]),
          o("db-bor",  "Bent-Over Dumbbell Row", ["dumbbell"]),
          o("bb-row2", "Bent-Over Barbell Row", ["barbell"])
        ]},
        { id:"v4", role:"Chest, second dose", sets:2, lo:10, hi:12, opts:[
          o("mch-press2","Machine Chest Press", ["machine"]),
          o("db-bench2", "Flat Dumbbell Press", ["dumbbell","bench"]),
          o("kb-floor2", "Kettlebell Floor Press", ["kettlebell"]),
          o("cbl-press", "Standing Cable Press", ["cable"]),
          o("bw-pushup2","Push-Up", [], { bw:true, lo:12, hi:25 })
        ]},
        { id:"v5", role:"Side delts", sets:3, lo:12, hi:15, opts:SIDE_DELT },
        { id:"v6", role:"Rear delts", sets:2, lo:12, hi:15, opts:REAR_DELT },
        { id:"v7", role:"Biceps", sets:2, lo:10, hi:15, opts:BICEP },
        { id:"v8", role:"Triceps", sets:2, lo:10, hi:15, opts:TRI_MAIN }
      ]},

    { id:"lower", num:"05", name:"Lower", day:"Saturday", muscles:"Legs &middot; Glutes &middot; Core &middot; Grip",
      coach:"Different movements from Wednesday so it isn't a repeat. The carry finishes the week with grip, traps, core and legs all working at once.",
      slots:[
        { id:"w1", role:"Squat pattern", sets:3, lo:8, hi:12, opts:[
          o("kb-goblet2","Goblet Squat", ["kettlebell"]),
          o("mch-hack2", "Hack Squat", ["machine"]),
          o("sm-squat2", "Smith Machine Squat", ["smith"]),
          o("db-frontsq2","Dumbbell Front-Rack Squat", ["dumbbell"]),
          o("bb-front",  "Barbell Front Squat", ["barbell"]),
          o("bw-sqjump", "Bodyweight Squat", [], { bw:true, lo:15, hi:25 })
        ]},
        { id:"w2", role:"Glutes", sets:3, lo:8, hi:12, opts:[
          o("bb-thrust", "Barbell Hip Thrust", ["barbell","bench"]),
          o("kb-thrust", "Kettlebell Hip Thrust", ["kettlebell","bench"]),
          o("db-thrust", "Dumbbell Hip Thrust", ["dumbbell","bench"]),
          o("mch-thrust","Machine Hip Thrust", ["machine"]),
          o("bnd-bridge","Band Glute Bridge", ["bands"]),
          o("bw-slbridge","Single-Leg Glute Bridge", [], { bw:true, perLeg:true, lo:12, hi:20 })
        ]},
        { id:"w3", role:"Hamstring curl", sets:3, lo:10, hi:15, opts:HAM_CURL },
        { id:"w4", role:"Split squat", sets:2, lo:8, hi:10, perLeg:true, opts:[
          o("db-bulg",  "Dumbbell Bulgarian Split Squat", ["dumbbell","bench"], { perLeg:true }),
          o("kb-bulg",  "Kettlebell Bulgarian Split Squat", ["kettlebell","bench"], { perLeg:true }),
          o("bb-split", "Barbell Split Squat", ["barbell"], { perLeg:true }),
          o("sm-split", "Smith Machine Split Squat", ["smith"], { perLeg:true }),
          o("bw-bulg",  "Bodyweight Bulgarian Split Squat", ["bench"], { bw:true, perLeg:true, lo:12, hi:20 }),
          o("bw-split", "Bodyweight Split Squat", [], { bw:true, perLeg:true, lo:12, hi:20 })
        ]},
        { id:"w5", role:"Calves", sets:3, lo:12, hi:15, opts:CALF },
        { id:"w6", role:"Abs", sets:3, lo:10, hi:15, opts:ABS },
        { id:"w7", role:"Finisher", sets:3, lo:30, hi:45, time:true, opts:[
          o("kb-farmer", "Kettlebell Farmer's Carry", ["kettlebell"], { time:true }),
          o("db-farmer", "Dumbbell Farmer's Carry", ["dumbbell"], { time:true }),
          o("kb-suitcase","Kettlebell Suitcase Carry", ["kettlebell"], { time:true, perLeg:true }),
          o("kb-rackcarry","Kettlebell Front-Rack Carry", ["kettlebell"], { time:true }),
          o("bb-carry",  "Barbell or Trap-Bar Carry", ["barbell"], { time:true }),
          o("kb-swing2", "Kettlebell Swing", ["kettlebell"], { lo:15, hi:20 }),
          o("bw-bear",   "Bear Crawl", [], { bw:true, time:true })
        ]}
      ]}
  ];

  /* ============ state ============ */
  var LS_KEY = "workout-tracker-v1";
  var LS_LEGACY = "comeback-block-v2";   /* pre-rename key; read once, then migrate */
  var migrated = false;
  var state = {
    week:1, day:"push", log:{}, notes:{}, pick:{},
    eq:JSON.parse(JSON.stringify(DEFAULT_EQ)), autovary:false, updatedAt:0
  };
  var saveTimer = null;

  function loadLocal(){
    try{
      var raw = localStorage.getItem(LS_KEY);
      if(!raw){ raw = localStorage.getItem(LS_LEGACY); if(raw) migrated = true; }
      if(raw){ var p = JSON.parse(raw); if(p && typeof p === "object") merge(p); }
    }catch(e){}
  }
  function merge(p){
    if(typeof p.week === "number" && p.week > 0) state.week = p.week;
    if(typeof p.day === "string") state.day = p.day;
    if(p.log && typeof p.log === "object") state.log = p.log;
    if(p.notes && typeof p.notes === "object") state.notes = p.notes;
    if(p.pick && typeof p.pick === "object") state.pick = p.pick;
    if(p.eq && typeof p.eq === "object"){
      for(var i = 0; i < EQUIP.length; i++){
        var id = EQUIP[i].id;
        if(typeof p.eq[id] === "boolean") state.eq[id] = p.eq[id];
      }
    }
    if(typeof p.autovary === "boolean") state.autovary = p.autovary;
    if(typeof p.updatedAt === "number") state.updatedAt = p.updatedAt;
  }
  function save(){
    state.updatedAt = Date.now();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function(){
      try{
        localStorage.setItem(LS_KEY, JSON.stringify(state));
        setSync(true, "Saved on this device");
      }catch(e){
        setSync(false, "Storage blocked \u2014 export a backup");
      }
    }, 250);
  }
  function setSync(on, msg){
    var d = document.getElementById("syncdot"), m = document.getElementById("syncmsg");
    if(d) d.className = "dot" + (on ? " on" : "");
    if(m) m.textContent = msg;
  }

  /* ============ selection ============ */
  function available(opt){
    for(var i = 0; i < opt.eq.length; i++){ if(!state.eq[opt.eq[i]]) return false; }
    return true;
  }
  function availableOpts(slot){
    var out = [];
    for(var i = 0; i < slot.opts.length; i++){ if(available(slot.opts[i])) out.push(slot.opts[i]); }
    return out;
  }
  function pkey(week, day, slot){ return "w" + week + "|" + day + "|" + slot; }
  function optById(slot, id){
    for(var i = 0; i < slot.opts.length; i++){ if(slot.opts[i].id === id) return slot.opts[i]; }
    return null;
  }
  function chosen(week, day, slot){
    var avail = availableOpts(slot);
    if(!avail.length) return null;
    var id = state.pick[pkey(week, day, slot.id)];
    if(id){ var hit = optById(slot, id); if(hit && available(hit)) return hit; }
    return avail[0];
  }
  /* fills in this week's picks so they stay put between renders */
  function seedWeek(week){
    var changed = false;
    for(var i = 0; i < PLAN.length; i++){
      var d = PLAN[i];
      for(var j = 0; j < d.slots.length; j++){
        var slot = d.slots[j], k = pkey(week, d.id, slot.id);
        var cur = state.pick[k] ? optById(slot, state.pick[k]) : null;
        if(cur && available(cur)) continue;
        var avail = availableOpts(slot);
        if(!avail.length){ if(state.pick[k]){ delete state.pick[k]; changed = true; } continue; }
        var next;
        if(!cur && week > 1 && state.pick[pkey(week - 1, d.id, slot.id)] && !state.autovary){
          var carry = optById(slot, state.pick[pkey(week - 1, d.id, slot.id)]);
          next = (carry && available(carry)) ? carry : avail[0];
        } else if(!cur && state.autovary){
          next = avail[Math.floor(Math.random() * avail.length)];
        } else {
          next = avail[0];
        }
        state.pick[k] = next.id; changed = true;
      }
    }
    return changed;
  }
  function reroll(day, slot){
    var avail = availableOpts(slot);
    if(avail.length < 2) return false;
    var cur = chosen(state.week, day, slot);
    var pool = avail.filter(function(x){ return !cur || x.id !== cur.id; });
    var next = pool[Math.floor(Math.random() * pool.length)];
    state.pick[pkey(state.week, day, slot.id)] = next.id;
    return true;
  }

  /* ============ per-set values ============ */
  function key(week, day, slot, set){ return "w" + week + "|" + day + "|" + slot + "|" + set; }
  function entry(week, day, slot, set){ return state.log[key(week, day, slot, set)] || null; }
  function setEntry(week, day, slot, set, patch){
    var k = key(week, day, slot, set), cur = state.log[k] || {};
    for(var p in patch){ cur[p] = patch[p]; }
    if(!cur.w && !cur.r && !cur.done) delete state.log[k]; else state.log[k] = cur;
    save();
  }
  function slotHasData(week, day, slot){
    for(var s = 0; s < slot.sets; s++){ if(entry(week, day, slot.id, s)) return true; }
    return false;
  }
  function clearSlot(week, day, slot){
    for(var s = 0; s < slot.sets; s++){ delete state.log[key(week, day, slot.id, s)]; }
  }
  function dayById(id){
    for(var i = 0; i < PLAN.length; i++){ if(PLAN[i].id === id) return PLAN[i]; }
    return PLAN[0];
  }
  function dayCounts(week, day){
    var d = dayById(day), total = 0, done = 0;
    for(var i = 0; i < d.slots.length; i++){
      var slot = d.slots[i];
      if(!chosen(week, day, slot)) continue;
      total += slot.sets;
      for(var s = 0; s < slot.sets; s++){ var en = entry(week, day, slot.id, s); if(en && en.done) done++; }
    }
    return { total:total, done:done };
  }
  function phaseFor(week){
    if(week <= 2) return { label:"Ramp-in", rir:"3&ndash;4 reps in reserve", sets:"2 working sets per exercise" };
    if(week <= 4) return { label:"Build", rir:"2&ndash;3 reps in reserve", sets:"Full sets as listed" };
    return { label:"Push on", rir:"1&ndash;2 reps in reserve", sets:"Full sets as listed" };
  }
  function eqTag(opt){
    if(!opt.eq.length) return EQ_LABEL.body;
    return opt.eq.map(function(e){ return EQ_LABEL[e]; }).join(" + ");
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, function(ch){
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[ch];
    });
  }

  var ICON_SWAP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H8a4 4 0 0 0-4 4"/>' +
    '<path d="M8 21l-4-4 4-4"/><path d="M4 17h12a4 4 0 0 0 4-4"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  /* ============ render ============ */
  function renderChrome(){
    document.getElementById("wlabel").textContent = "Week " + state.week;
    document.getElementById("wprev").disabled = state.week <= 1;
    var p = phaseFor(state.week);
    document.getElementById("phase").innerHTML =
      '<span class="tag">' + p.label + '</span><span>' + p.rir + '</span>' +
      '<span class="sep">/</span><span>' + p.sets + '</span>';

    document.getElementById("tabs").innerHTML = PLAN.map(function(d){
      var c = dayCounts(state.week, d.id);
      var pct = c.total ? Math.round(c.done / c.total * 100) : 0;
      return '<button class="tab" type="button" role="tab" data-day="' + d.id + '" ' +
        'aria-selected="' + (d.id === state.day) + '">' +
        '<span class="tnum">' + d.num + '</span><span class="tname">' + d.name + '</span>' +
        '<span class="tbar"><i style="width:' + pct + '%"></i></span></button>';
    }).join("");
  }

  function renderDay(){
    var d = dayById(state.day), w = state.week, c = dayCounts(w, d.id);

    var html = '<div class="dayhead">' +
        '<div class="daynum">' + d.num + '</div>' +
        '<div><h2>' + d.name + '</h2>' +
        '<div class="daymeta"><b>' + d.day + '</b>' + d.muscles + '</div></div>' +
        '<div class="dayprog">Sets logged<em>' + c.done + '/' + c.total + '</em></div>' +
      '</div>' +
      '<div class="dayactions">' +
        '<button class="chip" id="shuffleday" type="button">' + ICON_SWAP + 'Shuffle day</button>' +
      '</div>' +
      '<p class="coach">' + d.coach + '</p>';

    html += d.slots.map(function(slot){
      var opt = chosen(w, d.id, slot);
      var altCount = availableOpts(slot).length;

      if(!opt){
        return '<article class="card blocked"><div class="chead">' +
          '<div class="cname">' + slot.role +
          '<span class="cmeta">No match for your equipment</span></div></div>' +
          '<div class="blockedmsg">Nothing in this slot works with the gear you have switched on. ' +
          'Turn something on under <b>Gear</b>, or skip the slot this week.</div></article>';
      }

      var lo = opt.lo != null ? opt.lo : slot.lo;
      var hi = opt.hi != null ? opt.hi : slot.hi;
      var isTime = !!(opt.time || (slot.time && opt.time !== false));
      var perLeg = !!opt.perLeg;
      var unit = isTime ? "sec" : (perLeg ? "per side" : "reps");
      var target = slot.sets + " &times; " + lo + "&ndash;" + hi + (isTime ? " sec" : "");
      var allDone = true, rows = "";

      for(var s = 0; s < slot.sets; s++){
        var en = entry(w, d.id, slot.id, s) || {};
        if(!en.done) allDone = false;

        var prevTxt = "";
        if(w > 1){
          var prev = entry(w - 1, d.id, slot.id, s);
          if(prev && (prev.w || prev.r)){
            var prevId = state.pick[pkey(w - 1, d.id, slot.id)];
            var prevOpt = prevId ? optById(slot, prevId) : null;
            var sameLift = prevOpt && prevOpt.id === opt.id;
            prevTxt = '<div class="prev">Last week' +
              (sameLift ? "" : ' &middot; ' + (prevOpt ? prevOpt.name : "different lift")) +
              ' &middot; <b>' + (prev.w ? prev.w + " lb" : "BW") +
              (prev.r ? " &times; " + prev.r + (isTime ? "s" : "") : "") + '</b></div>';
          }
        }

        var weightCell = opt.bw
          ? '<div class="bw">Bodyweight</div>'
          : '<div class="field"><input type="number" inputmode="decimal" step="0.5" min="0" ' +
            'aria-label="Weight, set ' + (s + 1) + '" placeholder="&mdash;" ' +
            'data-slot="' + slot.id + '" data-set="' + s + '" data-f="w" value="' + (en.w || "") + '">' +
            '<span class="unit">lb</span></div>';

        rows += '<div class="setrow">' +
            '<span class="sidx">S' + (s + 1) + '</span>' + weightCell +
            '<span class="times">&times;</span>' +
            '<div class="field"><input type="number" inputmode="numeric" step="1" min="0" ' +
              'aria-label="' + (isTime ? "Seconds" : "Reps") + ', set ' + (s + 1) + '" ' +
              'placeholder="' + lo + '&ndash;' + hi + '" ' +
              'data-slot="' + slot.id + '" data-set="' + s + '" data-f="r" value="' + (en.r || "") + '">' +
              '<span class="unit">' + unit + '</span></div>' +
            '<button class="check" type="button" aria-pressed="' + (en.done ? "true" : "false") + '" ' +
              'aria-label="Mark set ' + (s + 1) + ' complete" data-slot="' + slot.id + '" data-set="' + s + '">' +
              ICON_CHECK + '</button>' +
          '</div>' + prevTxt;
      }

      return '<article class="card' + (allDone ? " done" : "") + '" data-slot="' + slot.id + '">' +
        '<div class="chead">' +
          '<div class="cname">' + opt.name +
            '<span class="cmeta">' + slot.role + ' <span class="eq">&middot; ' + eqTag(opt) + '</span></span>' +
          '</div>' +
          '<div class="cright"><span class="ctarget">' + target + '</span>' +
            '<button class="swap" type="button" data-swap="' + slot.id + '" ' +
              (altCount < 2 ? 'disabled ' : '') +
              'aria-label="Swap exercise (' + (altCount - 1) + ' alternatives)" ' +
              'title="' + (altCount < 2 ? "Only option with your equipment" : (altCount - 1) + " alternatives") + '">' +
              ICON_SWAP + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="sets">' + rows + '</div></article>';
    }).join("");

    var nk = "w" + w + "|" + d.id;
    html += '<div class="noteswrap"><label for="notes">Session notes</label>' +
      '<textarea id="notes" placeholder="How it felt, bell sizes, seat height, what to change next week&hellip;">' +
      escapeHtml(state.notes[nk] || "") + '</textarea></div>';

    document.getElementById("main").innerHTML = html;
  }

  function renderGear(){
    document.getElementById("eqlist").innerHTML = EQUIP.map(function(e){
      return '<button class="toggle" type="button" data-eq="' + e.id + '" aria-pressed="' +
        (state.eq[e.id] ? "true" : "false") + '">' +
        '<span class="tl"><b>' + e.name + '</b><span>' + e.note + '</span></span>' +
        '<span class="sw" aria-hidden="true"></span></button>';
    }).join("");

    document.getElementById("varylist").innerHTML =
      '<button class="toggle" type="button" data-vary="1" aria-pressed="' + (state.autovary ? "true" : "false") + '">' +
      '<span class="tl"><b>Auto-vary each week</b><span>Roll a fresh exercise for every slot when you move to a new week. ' +
      'Off means your picks carry forward, which makes week-to-week progression easier to read.</span></span>' +
      '<span class="sw" aria-hidden="true"></span></button>';

    var pool = 0, live = 0;
    for(var i = 0; i < PLAN.length; i++){
      for(var j = 0; j < PLAN[i].slots.length; j++){
        pool += PLAN[i].slots[j].opts.length;
        live += availableOpts(PLAN[i].slots[j]).length;
      }
    }
    document.getElementById("poolcount").innerHTML =
      live + " of " + pool + " exercises available with this setup";
  }

  function refreshProgress(){
    var c = dayCounts(state.week, state.day);
    var el = document.querySelector(".dayprog em");
    if(el) el.textContent = c.done + "/" + c.total;
    var bar = document.querySelector('.tab[data-day="' + state.day + '"] .tbar i');
    if(bar) bar.style.width = (c.total ? Math.round(c.done / c.total * 100) : 0) + "%";
  }

  function renderAll(){ seedWeek(state.week); renderChrome(); renderDay(); }

  /* ============ events ============ */
  document.getElementById("wprev").addEventListener("click", function(){
    if(state.week > 1){ state.week--; seedWeek(state.week); save(); renderAll(); window.scrollTo(0, 0); }
  });
  document.getElementById("wnext").addEventListener("click", function(){
    state.week++; seedWeek(state.week); save(); renderAll(); window.scrollTo(0, 0);
  });
  document.getElementById("tabs").addEventListener("click", function(ev){
    var t = ev.target.closest(".tab");
    if(!t) return;
    state.day = t.getAttribute("data-day"); save(); renderAll(); window.scrollTo(0, 0);
  });

  var swapArmed = null, swapTimer = null;
  function disarmSwap(){
    if(!swapArmed) return;
    var b = document.querySelector('.swap[data-swap="' + swapArmed + '"]');
    if(b) b.classList.remove("armed");
    swapArmed = null; clearTimeout(swapTimer);
  }

  document.getElementById("main").addEventListener("click", function(ev){
    var swap = ev.target.closest(".swap");
    if(swap){
      var d = dayById(state.day), sid = swap.getAttribute("data-swap"), slot = null;
      for(var i = 0; i < d.slots.length; i++){ if(d.slots[i].id === sid) slot = d.slots[i]; }
      if(!slot) return;
      if(slotHasData(state.week, d.id, slot) && swapArmed !== sid){
        disarmSwap();
        swapArmed = sid; swap.classList.add("armed");
        swap.setAttribute("title", "Tap again — this clears the numbers logged here");
        swapTimer = setTimeout(disarmSwap, 4000);
        return;
      }
      if(slotHasData(state.week, d.id, slot)) clearSlot(state.week, d.id, slot);
      disarmSwap();
      if(reroll(d.id, slot)){ save(); renderDay(); refreshProgress(); }
      return;
    }

    var shuffle = ev.target.closest("#shuffleday");
    if(shuffle){
      var day = dayById(state.day);
      if(!shuffle.classList.contains("armed")){
        shuffle.classList.add("armed");
        shuffle.innerHTML = ICON_SWAP + "Tap again to re-roll";
        setTimeout(function(){
          if(shuffle.isConnected){ shuffle.classList.remove("armed"); shuffle.innerHTML = ICON_SWAP + "Shuffle day"; }
        }, 4000);
        return;
      }
      for(var j = 0; j < day.slots.length; j++){
        if(slotHasData(state.week, day.id, day.slots[j])) clearSlot(state.week, day.id, day.slots[j]);
        reroll(day.id, day.slots[j]);
      }
      save(); renderAll(); window.scrollTo(0, 0);
      return;
    }

    var chk = ev.target.closest(".check");
    if(chk){
      var on = chk.getAttribute("aria-pressed") !== "true";
      chk.setAttribute("aria-pressed", on ? "true" : "false");
      setEntry(state.week, state.day, chk.getAttribute("data-slot"), +chk.getAttribute("data-set"), { done:on });
      var card = chk.closest(".card");
      if(card){
        var all = card.querySelectorAll(".check"), every = true;
        for(var k = 0; k < all.length; k++){ if(all[k].getAttribute("aria-pressed") !== "true") every = false; }
        card.classList.toggle("done", every);
      }
      refreshProgress();
    }
  });

  document.getElementById("main").addEventListener("input", function(ev){
    var el = ev.target;
    if(el.id === "notes"){
      state.notes["w" + state.week + "|" + state.day] = el.value; save(); return;
    }
    if(el.tagName !== "INPUT") return;
    var patch = {};
    patch[el.getAttribute("data-f")] = el.value;
    setEntry(state.week, state.day, el.getAttribute("data-slot"), +el.getAttribute("data-set"), patch);
  });

  /* gear sheet */
  document.getElementById("gearscrim").addEventListener("click", function(ev){
    var t = ev.target.closest(".toggle");
    if(t){
      if(t.hasAttribute("data-eq")){
        var id = t.getAttribute("data-eq");
        state.eq[id] = !state.eq[id];
      } else {
        state.autovary = !state.autovary;
      }
      save(); renderGear(); renderAll();
      return;
    }
    if(ev.target === this || ev.target.getAttribute("data-close") === "gearscrim"){
      this.classList.add("hidden");
    }
  });
  document.getElementById("gearbtn").addEventListener("click", function(){
    renderGear();
    document.getElementById("gearscrim").classList.remove("hidden");
  });

  /* guide sheet */
  var scrim = document.getElementById("scrim");
  document.getElementById("guidebtn").addEventListener("click", function(){ scrim.classList.remove("hidden"); });
  scrim.addEventListener("click", function(ev){
    if(ev.target === scrim || ev.target.getAttribute("data-close") === "scrim") scrim.classList.add("hidden");
  });
  document.addEventListener("keydown", function(ev){
    if(ev.key !== "Escape") return;
    scrim.classList.add("hidden");
    document.getElementById("gearscrim").classList.add("hidden");
  });

  var clearArmed = false, clearTimer = null;
  document.getElementById("clearbtn").addEventListener("click", function(){
    var b = this;
    if(!clearArmed){
      clearArmed = true; b.textContent = "Tap again to clear week " + state.week;
      clearTimer = setTimeout(function(){ clearArmed = false; b.textContent = "Clear this week"; }, 4000);
      return;
    }
    clearTimeout(clearTimer); clearArmed = false; b.textContent = "Clear this week";
    var pfx = "w" + state.week + "|";
    Object.keys(state.log).forEach(function(k){ if(k.indexOf(pfx) === 0) delete state.log[k]; });
    Object.keys(state.notes).forEach(function(k){ if(k.indexOf(pfx) === 0) delete state.notes[k]; });
    save(); renderAll(); scrim.classList.add("hidden");
  });

  function stickTabs(){
    var h = document.getElementById("topbar").offsetHeight;
    document.getElementById("tabs").style.setProperty("--tabtop", h + "px");
  }
  window.addEventListener("resize", stickTabs);

  /* ============ backup ============ */
  function stamp(){
    var d = new Date(), p = function(n){ return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }
  document.getElementById("exportbtn").addEventListener("click", function(){
    var blob = new Blob([JSON.stringify(state, null, 2)], { type:"application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "workout-tracker-" + stamp() + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  });
  document.getElementById("importbtn").addEventListener("click", function(){
    document.getElementById("importfile").click();
  });
  document.getElementById("importfile").addEventListener("change", function(){
    var f = this.files && this.files[0];
    if(!f) return;
    var fr = new FileReader();
    var input = this;
    fr.onload = function(){
      var status = document.getElementById("importstatus");
      try{
        var parsed = JSON.parse(fr.result);
        if(!parsed || typeof parsed !== "object") throw new Error("not an object");
        merge(parsed); save(); renderAll();
        status.textContent = "Backup loaded. " + Object.keys(state.log).length + " logged sets restored.";
      }catch(e){
        status.textContent = "That file isn't a Workout Tracker backup.";
      }
      input.value = "";
    };
    fr.readAsText(f);
  });

  /* ============ boot ============ */
  loadLocal();
  renderAll();
  if(migrated) save();   /* rewrite the pre-rename log under the new key */
  stickTabs();
  setTimeout(stickTabs, 400);
  setSync(true, "Saved on this device");

})();
