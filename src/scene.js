import * as THREE from "three";
export function createScene(host, onFailure) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#dcded5");
  scene.fog = new THREE.Fog("#dcded5", 8, 18);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 2.7, 8.5);
  camera.lookAt(0, 1.65, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x77786d, 2.5));
  const light = new THREE.DirectionalLight(0xffffff, 4);
  light.position.set(-3, 7, 4);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  scene.add(light);
  const ivory = new THREE.MeshStandardMaterial({
    color: 0xc7c5b8,
    roughness: 0.65,
    metalness: 0.08,
  });
  const mannequin = new THREE.Group();
  scene.add(mannequin);
  const clothes = new THREE.Group();
  mannequin.add(clothes);
  function mesh(geometry, material, parent = mannequin, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  mesh(
    new THREE.SphereGeometry(0.18, 32, 24),
    ivory,
    mannequin,
    0,
    3.24,
  ).scale.set(0.82, 1.3, 0.86);
  mesh(
    new THREE.CylinderGeometry(0.065, 0.085, 0.18, 24),
    ivory,
    mannequin,
    0,
    2.98,
  );
  mesh(
    new THREE.CylinderGeometry(0.27, 0.2, 0.7, 32),
    ivory,
    mannequin,
    0,
    2.58,
  ).scale.z = 0.62;
  mesh(
    new THREE.SphereGeometry(0.245, 24, 16),
    ivory,
    mannequin,
    0,
    2.12,
  ).scale.set(1, 0.8, 0.65);
  for (const side of [-1, 1]) {
    const arm = mesh(
      new THREE.CapsuleGeometry(0.065, 0.91, 8, 16),
      ivory,
      mannequin,
      side * 0.34,
      2.35,
    );
    arm.rotation.z = side * 0.13;
    mesh(
      new THREE.SphereGeometry(0.065, 16, 12),
      ivory,
      mannequin,
      side * 0.41,
      1.79,
    ).scale.y = 1.5;
    mesh(
      new THREE.CylinderGeometry(0.1, 0.065, 1.36, 24),
      ivory,
      mannequin,
      side * 0.13,
      1.42,
    );
    mesh(
      new THREE.SphereGeometry(0.11, 20, 16),
      ivory,
      mannequin,
      side * 0.13,
      0.69,
      0.05,
    ).scale.set(0.8, 0.6, 1.8);
  }
  mesh(
    new THREE.CylinderGeometry(0.73, 0.76, 0.28, 64),
    new THREE.MeshStandardMaterial({ color: 0xc8c9bf, roughness: 0.85 }),
    scene,
    0,
    0.47,
  );
  mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0xdcded5, roughness: 1 }),
    scene,
    0,
    0.32,
  ).rotation.x = -Math.PI / 2;
  // Architectural backdrop: gently lit monolithic wall panels.
  for (const x of [-2.6, 2.6])
    mesh(
      new THREE.BoxGeometry(0.32, 7, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xd2d4ca, roughness: 1 }),
      scene,
      x,
      3,
      -1.7,
    );
  function profile(points, mat) {
    return mesh(
      new THREE.LatheGeometry(
        points.map(([r, y]) => new THREE.Vector2(r, y)),
        64,
      ),
      mat,
      clothes,
    );
  }

  function clearClothes() {
    for (const m of [...clothes.children]) {
      clothes.remove(m);
      m.geometry.dispose();
      m.material.dispose();
    }
  }
  let transitionTime = 1;
  function setOutfit(products) {
    clearClothes();
    transitionTime = 0;
    for (const p of products) {
      const fabric = new THREE.MeshStandardMaterial({
        color: p.color || "#444",
        roughness: 0.86,
        side: THREE.DoubleSide,
      });
      const type = p.type;
      if (type === "dress" || type === "gown") {
        const gown = type === "gown";
        profile(
          [
            [gown ? 0.59 : 0.42, 0.78],
            [gown ? 0.47 : 0.34, 1.2],
            [0.31, 1.8],
            [0.28, 2.2],
            [0.29, 2.56],
            [0.26, 2.9],
          ],
          fabric,
        ).scale.z = 0.7;
      }
      if (["shirt", "jacket", "set"].includes(type)) {
        const outer = type === "jacket";
        profile(
          [
            [outer ? 0.35 : 0.31, 2.02],
            [outer ? 0.33 : 0.29, 2.4],
            [outer ? 0.37 : 0.33, 2.7],
            [0.26, 2.92],
          ],
          fabric,
        ).scale.z = 0.73;
        for (const side of [-1, 1]) {
          const sleeve = mesh(
            new THREE.CylinderGeometry(
              outer ? 0.14 : 0.12,
              outer ? 0.15 : 0.14,
              0.65,
              24,
            ),
            fabric.clone(),
            clothes,
            side * 0.35,
            2.59,
          );
          sleeve.rotation.z = side * 0.15;
        }
      }
      if (type === "trousers" || type === "set") {
        for (const side of [-1, 1])
          mesh(
            new THREE.CylinderGeometry(0.145, 0.135, 1.37, 24),
            fabric.clone(),
            clothes,
            side * 0.15,
            1.4,
          );
        profile(
          [
            [0.29, 1.96],
            [0.285, 2.18],
          ],
          fabric.clone(),
        ).scale.z = 0.73;
      }
    }
  }
  let auto = true,
    dragging = false,
    lastX = 0,
    visible = true;
  const down = (e) => {
    dragging = true;
    lastX = e.clientX;
    host.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (dragging) {
      mannequin.rotation.y += (e.clientX - lastX) * 0.009;
      lastX = e.clientX;
    }
  };
  const up = () => (dragging = false);
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  const resize = new ResizeObserver(() => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
  });
  resize.observe(host);
  const observer = new IntersectionObserver(
    (e) => (visible = e[0].isIntersecting),
  );
  observer.observe(host);
  const lost = (e) => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    onFailure();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  const clock = new THREE.Clock();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible || document.hidden) return;
    if (auto && !dragging) mannequin.rotation.y += dt * 0.28;
    transitionTime = Math.min(1, transitionTime + dt * 2.5);
    clothes.scale.setScalar(
      reduced.matches ? 1 : 0.92 + 0.08 * (1 - Math.pow(1 - transitionTime, 3)),
    );
    renderer.render(scene, camera);
  });
  return {
    setOutfit,
    setAuto: (value) => (auto = value),
    rotate: (value) => (mannequin.rotation.y += value),
    dispose() {
      renderer.setAnimationLoop(null);
      resize.disconnect();
      observer.disconnect();
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
