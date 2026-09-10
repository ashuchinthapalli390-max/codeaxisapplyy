async function updatePhotos() {
  console.log("=== UPDATING FOUNDER, CO-FOUNDER, AND CEO PHOTOS IN PRODUCTION ===");
  const loginRes = await fetch("https://www.codeaxisapply.xyz/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessKey: "161217110311" }),
  });
  const cookie = loginRes.headers.get("set-cookie").split(";")[0];

  const adminRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
    headers: { cookie },
  });
  const adminData = await adminRes.json();
  const members = adminData.data || [];

  const updates = [
    {
      role: "Founder",
      match: (m) => m.roleType === "Founder" || m.name.includes("Arshad"),
      photoUrl: "/assets/image-assests/founder.jpeg",
      crop_x: 50,
      crop_y: 35,
    },
    {
      role: "Co-Founder",
      match: (m) => m.roleType === "Co-Founder" || m.name.includes("Sanjay"),
      photoUrl: "/assets/image-assests/co-founder.jpeg",
      crop_x: 50,
      crop_y: 28,
    },
    {
      role: "CEO (Kishore)",
      match: (m) => m.name === "Kishore" || m.id === "148ed82c-a0a1-40b1-b91f-9447726a0f9b",
      photoUrl: "/assets/image-assests/ceo.jpeg",
      crop_x: 50,
      crop_y: 25,
    },
  ];

  for (const item of updates) {
    const member = members.find(item.match);
    if (!member) {
      console.warn("Could not find member for:", item.role);
      continue;
    }
    console.log(`Updating ${member.name} (${item.role})...`);
    const updateRes = await fetch("https://www.codeaxisapply.xyz/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({
        ...member,
        photoUrl: item.photoUrl,
        image_path: item.photoUrl,
        profileStoragePath: item.photoUrl,
        crop_x: item.crop_x,
        crop_y: item.crop_y,
        profileObjectPositionX: item.crop_x,
        profileObjectPositionY: item.crop_y,
        expectedVersion: member.version,
      }),
    });
    const updateJson = await updateRes.json();
    console.log(`Result for ${member.name}:`, updateRes.status, updateJson.success ? "SUCCESS" : updateJson);
  }
}

updatePhotos().catch(console.error);
