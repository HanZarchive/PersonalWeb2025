/* ========================================
   WHERE TO FIND WILDLIFE — Map JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  let latestFetchId = 0;

  // Helper to get current dropdown value
  function getDropdownValue(dropdownEl) {
    const selected = dropdownEl.querySelector('.map-dropdown__item.selected');
    return selected ? selected.dataset.value : '';
  }

  // ---------- Park Coordinates ----------
  const parks = {
    'yosemite':     { center: [37.8651, -119.5383], zoom: 10 },
    'yellowstone':  { center: [44.4280, -110.5885], zoom: 9 },
    'death-valley': { center: [36.5054, -117.0794], zoom: 10 },
    'glacier':      { center: [48.7596, -113.7870], zoom: 10 },
    'grand-canyon':  { center: [36.1069, -112.1129], zoom: 10 },
    'zion':         { center: [37.2982, -113.0263], zoom: 11 }
  };

  // ---------- Monthly activity data per species ----------
  const speciesData = {
    'amphibians':    [5, 8, 20, 45, 70, 90, 85, 75, 50, 25, 10, 5],
    'large-mammals': [15, 20, 35, 50, 65, 80, 85, 90, 70, 55, 30, 15],
    'small-mammals': [20, 30, 60, 80, 90, 75, 70, 65, 55, 40, 25, 15],
    'birds':         [10, 15, 45, 75, 90, 85, 80, 70, 55, 35, 15, 8],
    'reptiles':      [2, 5, 15, 35, 60, 80, 90, 85, 60, 30, 10, 3],
    'fish':          [20, 25, 35, 50, 65, 85, 90, 80, 65, 45, 30, 20]
  };

  // ---------- Initialize Map ----------
  const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(parks['yosemite'].center, parks['yosemite'].zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 16
  }).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);

  // ---------- Heatmap Canvas ----------
  const canvas = document.getElementById('heatmap-canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const container = document.querySelector('.map-container');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // async function drawHeatmap(monthIndex) {
  //   // 1. 获取当前选中的条件
  //   const parkKey = document.getElementById('park-select').value;
  //   const species = document.getElementById('species-select').value;
    
  //   // 注意：你时间轴传来的 monthIndex 是 0-11 (JS 数组习惯)
  //   // 但我们的后端和 GBIF 认的是 1-12 月，所以要加 1
  //   const realMonth = monthIndex + 1; 

  //   try {
  //     // 2. 向你的本地服务器请求真实数据 (请确保你的 Node 服务器没关)
  //     const response = await fetch(`http://localhost:3000/api/heatmap?park=${parkKey}&species=${species}&month=${realMonth}`);
      
  //     if (!response.ok) throw new Error("获取热力图数据失败");
      
  //     const realData = await response.json();

  //     // 3. 遍历真实坐标并绘制热力点
  //     realData.forEach(point => {
  //       // 【核心魔法】将真实的地球经纬度，转换为当前屏幕 Canvas 上的 x, y 像素点
  //       const screenPos = map.latLngToContainerPoint([point.lat, point.lng]);
        
  //       // 我们给真实的观测点一个固定的物理半径和强度
  //       const radius = 80; 
  //       const intensity = point.weight / 100; // 转化为 0-1 的透明度

  //       // 开始在真实的坐标位置上画渐变圆圈
  //       const gradient = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, radius);
        
  //       // 这里的颜色依然沿用你原本设计的暖色调，只保留最高两层的颜色逻辑让它看起来干净些
  //       gradient.addColorStop(0, `rgba(196, 80, 26, ${intensity})`);
  //       gradient.addColorStop(0.5, `rgba(232, 168, 76, ${intensity * 0.5})`);
  //       gradient.addColorStop(1, `rgba(248, 237, 226, 0)`);

  //       ctx.fillStyle = gradient;
  //       ctx.fillRect(0, 0, canvas.width, canvas.height);
  //     });

  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
async function drawHeatmap(monthIndex) {
    const parkKey = getDropdownValue(document.getElementById('park-dropdown'));
    const species = getDropdownValue(document.getElementById('species-dropdown'));
    const realMonth = monthIndex + 1;

    // 给当前这次请求发一个独一无二的时间戳 ID
    const currentFetchId = Date.now();
    latestFetchId = currentFetchId;

    try {
      // 去后端拉取数据
      const response = await fetch(`/api/heatmap?park=${parkKey}&species=${species}&month=${realMonth}`);
      if (!response.ok) throw new Error("获取热力图数据失败");
      const realData = await response.json();

      // 【核心防叠加上锁】：如果数据回来时，发现最新的 ID 已经变了
      // 说明用户已经滑到了别的月份，这份数据是过期的，直接丢弃，不执行画图！
      if (currentFetchId !== latestFetchId) {
        return; 
      }

      // 【核心黑板擦】：在确认数据是最新的、且准备开始画之前，彻底清空画布！
      resizeCanvas(); // 确保画布尺寸和窗口一致
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 擦掉上个月的所有痕迹

      // 开始遍历真实坐标并绘制热力点
      realData.forEach(point => {
        const screenPos = map.latLngToContainerPoint([point.lat, point.lng]);
        
        const radius = 80; 
        const intensity = point.weight / 100; 

        const gradient = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, radius);
        
        gradient.addColorStop(0, `rgba(196, 80, 26, ${intensity})`);
        gradient.addColorStop(0.5, `rgba(232, 168, 76, ${intensity * 0.5})`);
        gradient.addColorStop(1, `rgba(248, 237, 226, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

    } catch (error) {
      console.error("渲染热力图出错:", error);
    }
}

  // ---------- Timeline Slider ----------
  const track = document.getElementById('timeline-track');
  const thumb = document.getElementById('timeline-thumb');
  const fill = document.getElementById('timeline-fill');
  const barsContainer = document.getElementById('timeline-bars');
  const bars = document.querySelectorAll('.timeline-bar');
  const ticks = document.querySelectorAll('.timeline-tick');

  let currentMonth = 5; // June
  let isDragging = false;
  let dragStartTime = 0;
  let showBarsTimeout = null;

  function updateTimeline(monthIndex, animate = true) {
    currentMonth = Math.max(0, Math.min(11, monthIndex));
    const pct = (currentMonth / 11) * 100;

    thumb.style.left = pct + '%';
    fill.style.width = pct + '%';

    // Update active tick
    ticks.forEach((t, i) => {
      t.classList.toggle('active', i === currentMonth);
    });

    // Update heatmap
    drawHeatmap(currentMonth);
  }

  function updateBars() {
    const species = getDropdownValue(document.getElementById('species-dropdown'));
    const data = speciesData[species];
    bars.forEach((bar, i) => {
      const h = (data[i] / 100) * 36;
      bar.style.height = h + 'px';
    });
  }

  function showBars() {
    updateBars();
    barsContainer.classList.add('show-bars');
  }

  function hideBars() {
    barsContainer.classList.remove('show-bars');
  }

  function getMonthFromX(clientX) {
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    return Math.round(pct * 11);
  }

  // Mouse events for slider
  thumb.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartTime = Date.now();
    thumb.classList.add('dragging');
    showBars();
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const month = getMonthFromX(e.clientX);
    updateTimeline(month);
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    thumb.classList.remove('dragging');
    // Hide bars after settling on a point
    clearTimeout(showBarsTimeout);
    showBarsTimeout = setTimeout(hideBars, 400);
  });

  // Touch events
  thumb.addEventListener('touchstart', (e) => {
    isDragging = true;
    thumb.classList.add('dragging');
    showBars();
    e.preventDefault();
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const month = getMonthFromX(touch.clientX);
    updateTimeline(month);
  });

  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    thumb.classList.remove('dragging');
    clearTimeout(showBarsTimeout);
    showBarsTimeout = setTimeout(hideBars, 400);
  });

  // Click on track
  track.addEventListener('click', (e) => {
    const month = getMonthFromX(e.clientX);
    showBars();
    updateTimeline(month);
    clearTimeout(showBarsTimeout);
    showBarsTimeout = setTimeout(hideBars, 600);
  });

  // Click on tick label
  ticks.forEach(tick => {
    tick.style.cursor = 'pointer';
    tick.addEventListener('click', () => {
      const month = parseInt(tick.dataset.month);
      updateTimeline(month);
    });
  });

  // ---------- Custom Dropdown Logic ----------
  const controlsEl = document.querySelector('.map-controls');
  L.DomEvent.disableClickPropagation(controlsEl);
  L.DomEvent.disableScrollPropagation(controlsEl);

  function setupDropdown(dropdownEl) {
    const trigger = dropdownEl.querySelector('.map-dropdown__trigger');
    const label = dropdownEl.querySelector('.map-dropdown__label');
    const items = dropdownEl.querySelectorAll('.map-dropdown__item');

    trigger.onclick = function (e) {
      e.stopPropagation();
      document.querySelectorAll('.map-dropdown.open').forEach(d => {
        if (d !== dropdownEl) d.classList.remove('open');
      });
      dropdownEl.classList.toggle('open');
    };

    items.forEach(item => {
      item.onclick = function (e) {
        e.stopPropagation();
        items.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        label.textContent = item.textContent;
        dropdownEl.classList.remove('open');
        dropdownEl.dispatchEvent(new CustomEvent('dropdown-change', {
          detail: { value: item.dataset.value }
        }));
      };
    });
  }

  const parkDropdown = document.getElementById('park-dropdown');
  const speciesDropdown = document.getElementById('species-dropdown');
  setupDropdown(parkDropdown);
  setupDropdown(speciesDropdown);

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.map-dropdown')) {
      document.querySelectorAll('.map-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });

  // ---------- Park Select ----------
  parkDropdown.addEventListener('dropdown-change', (e) => {
    const park = parks[e.detail.value];
    if (park) {
      map.flyTo(park.center, park.zoom, { duration: 1.2 });
      setTimeout(() => drawHeatmap(currentMonth), 300);
    }
  });

  // ---------- Species Select ----------
  speciesDropdown.addEventListener('dropdown-change', () => {
    drawHeatmap(currentMonth);
    if (barsContainer.classList.contains('show-bars')) {
      updateBars();
    }
  });

  // ---------- Apply URL parameters ----------
  // Programmatic helper: select a dropdown item by its data-value
  function selectDropdownValue(dropdownEl, value) {
    const items = dropdownEl.querySelectorAll('.map-dropdown__item');
    const label = dropdownEl.querySelector('.map-dropdown__label');
    const match = Array.from(items).find(i => i.dataset.value === value);
    if (!match) return false;
    items.forEach(i => i.classList.remove('selected'));
    match.classList.add('selected');
    label.textContent = match.textContent;
    dropdownEl.dispatchEvent(new CustomEvent('dropdown-change', {
      detail: { value: match.dataset.value }
    }));
    return true;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const paramSpecies = urlParams.get('species');
  const paramPark = urlParams.get('park');
  if (paramSpecies) selectDropdownValue(speciesDropdown, paramSpecies);
  if (paramPark) selectDropdownValue(parkDropdown, paramPark);

  // ---------- Initial State ----------
  updateTimeline(5);
  updateBars();

  // Redraw heatmap on map move
  map.on('moveend', () => drawHeatmap(currentMonth));
  map.on('zoomend', () => drawHeatmap(currentMonth));
});
