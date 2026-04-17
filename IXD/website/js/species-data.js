/* ========================================
   WHERE TO FIND WILDLIFE — Species Data
   Shared data for species detail & search
   ======================================== */

const SPECIES_DATA = {
  'large-mammals': {
    name: 'Large Mammals',
    mapValue: 'large-mammals',
    season: 'Autumn',
    activity: 'high',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&q=85',
    cutout: 'assets/Large Mammals.png',
    description: 'Large mammals are among the most iconic inhabitants of North American national parks. This group includes black bears, grizzly bears, elk, moose, bison, mountain lions, and wolves. These animals play a critical role in maintaining ecosystem balance through predation, grazing, and seed dispersal. Most large mammals are crepuscular, meaning they are most active during dawn and dusk. In autumn, bears enter a period of hyperphagia, feeding intensely to build fat reserves before winter hibernation. Elk and deer engage in their annual rut, filling valleys with bugling calls. Winter drives many species to lower elevations, while spring brings newborn calves and cubs into meadows and forest clearings.',
    examples: ['Black Bear', 'Grizzly Bear', 'Elk', 'Moose', 'Bison', 'Mountain Lion']
  },
  'small-mammals': {
    name: 'Small Mammals',
    mapValue: 'small-mammals',
    season: 'Spring',
    activity: 'peak',
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=85',
    cutout: 'assets/Small Mammals.png',
    description: 'Small mammals form the foundation of many national park food webs. River otters, marmots, pikas, squirrels, chipmunks, raccoons, and beavers each occupy unique ecological niches. Pikas are particularly sensitive environmental indicators, retreating to higher elevations as temperatures rise. Beavers are ecosystem engineers whose dams create wetland habitats that support hundreds of other species. Spring marks the peak of small mammal activity, as many species emerge from hibernation or winter torpor. Marmots whistle alarm calls across alpine meadows, while river otters slide down muddy banks in playful family groups. These animals are often the most frequently spotted wildlife in any park visit.',
    examples: ['River Otter', 'Marmot', 'Pika', 'Squirrel', 'Chipmunk', 'Beaver']
  },
  'raptors': {
    name: 'Raptors',
    mapValue: 'birds',
    season: 'Winter',
    activity: 'medium',
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=85',
    cutout: 'assets/Raptors.png',
    description: 'Raptors, or birds of prey, are the aerial apex predators of national park ecosystems. This group encompasses eagles, hawks, falcons, owls, and ospreys. Bald eagles congregate along rivers during salmon runs, while peregrine falcons execute breathtaking stoops at speeds exceeding 240 miles per hour. Great horned owls patrol forests at night with near-silent flight, and red-tailed hawks circle on thermals above open valleys. Winter is an excellent time for raptor observation, as leafless trees make nesting and perching birds more visible, and many species gather near open water sources. Their presence indicates a healthy, functioning ecosystem with abundant prey populations.',
    examples: ['Bald Eagle', 'Great Horned Owl', 'Peregrine Falcon', 'Red-tailed Hawk', 'Osprey']
  },
  'waterbirds': {
    name: 'Waterbirds',
    mapValue: 'birds',
    season: 'Autumn',
    activity: 'high',
    image: 'https://images.unsplash.com/photo-1551085254-e96b210db58a?w=800&q=85',
    cutout: 'assets/Waterbirds.png',
    description: 'Waterbirds are the signature wildlife of lakes, rivers, marshes, and coastal areas within national parks. Canada geese, great blue herons, sandhill cranes, pelicans, and various duck species rely on healthy wetland habitats for feeding and breeding. Autumn migration transforms park waterways into staging areas for thousands of birds making their journey south. Great blue herons stand motionless in shallows, striking with lightning speed at fish below the surface. Sandhill cranes perform elaborate dancing courtship displays that have remained unchanged for millions of years. Many waterbird species serve as indicators of water quality, making their populations closely monitored by park ecologists.',
    examples: ['Canada Goose', 'Great Blue Heron', 'Sandhill Crane', 'Pelican', 'Mallard']
  },
  'songbirds': {
    name: 'Songbirds & Others',
    mapValue: 'birds',
    season: 'Spring',
    activity: 'peak',
    image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800&q=85',
    cutout: 'assets/Songbirds & Others.png',
    description: 'Songbirds and passerines represent the most diverse group of birds in national parks, with hundreds of species contributing to the rich soundscapes of forests, meadows, and alpine zones. Mountain bluebirds flash brilliant cerulean as they hawk insects over grasslands. Warblers, thrushes, sparrows, and wrens fill spring mornings with complex territorial songs. Many species undertake remarkable long-distance migrations, traveling thousands of miles between breeding and wintering grounds. Spring is the peak season for songbird activity, as males establish territories through song and females build nests. Dawn choruses in old-growth forests can include dozens of species singing simultaneously, creating one of nature\'s most immersive experiences.',
    examples: ['Mountain Bluebird', 'American Robin', 'Warbler', 'Wren', 'Thrush', 'Sparrow']
  },
  'reptiles': {
    name: 'Reptiles',
    mapValue: 'reptiles',
    season: 'Summer',
    activity: 'low',
    image: 'https://images.unsplash.com/photo-1497752531616-c3afd9760a11?w=800&q=85',
    cutout: 'assets/Reptiles.png',
    description: 'Reptiles in national parks include turtles, lizards, and snakes, each adapted to specific temperature and habitat conditions. As ectotherms, reptiles depend on external heat sources to regulate body temperature, making them most active during warm summer months. Painted turtles bask on logs in quiet ponds, while collared lizards display brilliant turquoise and yellow patterns on rocky outcrops. Rattlesnakes, though often feared, play vital roles in controlling rodent populations. Many reptile species are long-lived, with some turtles surviving for decades. Their activity patterns are closely tied to ambient temperature, and observers will find the best sighting opportunities during warm mornings when reptiles emerge to thermoregulate.',
    examples: ['Painted Turtle', 'Collared Lizard', 'Rattlesnake', 'Garter Snake', 'Skink']
  },
  'amphibians': {
    name: 'Amphibians',
    mapValue: 'amphibians',
    season: 'Summer',
    activity: 'peak',
    image: 'https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=800&q=85',
    cutout: 'assets/Amphibians.png',
    description: 'Amphibians are among the most sensitive indicators of environmental health in national parks. Frogs, toads, salamanders, and newts depend on clean water for breeding and moist habitats throughout their lives. The spring chorus of Pacific tree frogs and American bullfrogs signals the onset of breeding season, when vernal pools and wetlands come alive with calling males. Salamanders, often hidden beneath logs and rocks, represent remarkable biodiversity in temperate forests. Many amphibian species are experiencing global population declines due to habitat loss, climate change, and chytrid fungus. Parks serve as critical refugia where these vulnerable species can persist in protected watersheds.',
    examples: ['American Bullfrog', 'Pacific Tree Frog', 'Tiger Salamander', 'Red-spotted Newt']
  },
  'butterflies': {
    name: 'Butterflies & Moths',
    mapValue: null,
    season: 'Summer',
    activity: 'medium',
    image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=85',
    cutout: 'assets/Butterflies & Moths.png',
    description: 'Butterflies and moths are essential pollinators and serve as delicate indicators of ecosystem health across national parks. Monarch butterflies undertake one of the most extraordinary migrations in the animal kingdom, traveling up to 3,000 miles between their breeding grounds and overwintering sites. Swallowtails, painted ladies, and fritillaries add brilliant splashes of color to alpine meadows and forest edges during summer months. Moths, though less conspicuous, far outnumber butterflies in species diversity and play crucial roles in nighttime pollination. Luna moths and sphinx moths are among the most striking nocturnal visitors. Wildflower meadows in full bloom attract the highest concentrations of these insects.',
    examples: ['Monarch Butterfly', 'Swallowtail', 'Painted Lady', 'Luna Moth', 'Fritillary']
  },
  'other-insects': {
    name: 'Other Insects',
    mapValue: null,
    season: 'Summer',
    activity: 'high',
    image: 'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=800&q=85',
    cutout: 'assets/Other insects.png',
    description: 'Insects form the vast foundation of biodiversity in every national park ecosystem. Bees, beetles, dragonflies, damselflies, and countless other species perform essential ecological services from pollination to decomposition. Honeybees and native bumblebees are critical pollinators for wildflowers and many plant species that park wildlife depends on for food. Dragonflies patrol wetlands and streams as both predators and prey, their iridescent wings flashing in sunlight. Beetles represent the single most species-rich order of animals on Earth, with thousands of species inhabiting park forests, meadows, and waterways. Summer is the peak season for insect activity, when warm temperatures accelerate life cycles and blooming plants provide abundant nectar.',
    examples: ['Honeybee', 'Bumblebee', 'Dragonfly', 'Damselfly', 'Beetle', 'Firefly']
  },
  'fish': {
    name: 'Fish',
    mapValue: 'fish',
    season: 'Summer',
    activity: 'high',
    image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=85',
    cutout: 'assets/Fish.png',
    description: 'Fish are vital components of aquatic ecosystems in national parks, connecting terrestrial and aquatic food webs. Native trout species, including cutthroat, rainbow, and brook trout, inhabit cold mountain streams and alpine lakes. Salmon runs are among nature\'s most dramatic spectacles, as fish fight upstream through rapids and waterfalls to reach ancestral spawning grounds. These migrations transfer enormous quantities of marine-derived nutrients into freshwater and terrestrial ecosystems, feeding bears, eagles, and enriching riverside soils. Many parks protect critical habitat for threatened native fish species. Summer provides the best observation opportunities, particularly along clear streams and during spawning season when fish are most active and visible.',
    examples: ['Cutthroat Trout', 'Rainbow Trout', 'Chinook Salmon', 'Brook Trout', 'Kokanee']
  }
};
