async function getCompanyData(company) {

  const res = await fetch(
    `http://localhost:5000/company/${company}`,
    {
      cache: "no-store"
    }
  );

  return res.json();
}

export default async function CompanyPage({ params }) {

  const resolvedParams = await params;

  const company = resolvedParams.company;

  const data = await getCompanyData(company);

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-4xl font-bold mb-8">
        {company} Salaries
      </h1>

      <div className="grid gap-6">

        {data.map((s) => (

          <div
            key={s.id}
            className="bg-white p-6 rounded-xl shadow"
          >

            <h2 className="text-2xl font-bold">
              {s.role}
            </h2>

            <p className="text-gray-600">
              {s.level} • {s.location}
            </p>

            <p className="mt-4 text-green-600 text-2xl font-bold">
              ₹ {s.total_compensation}
            </p>

          </div>

        ))}

      </div>

    </div>

  );
}