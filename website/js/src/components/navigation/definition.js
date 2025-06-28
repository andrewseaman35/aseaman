const NAVIGATION_DEFINITION = [
    {
        id: 'nav-web-things',
        label: 'Web Things',
        nestedItems: [
            {id: 'chess', label: 'Chess', destination: '/chess/index'},
            {id: 'villager-showdown', label: 'ACNH Showdown', destination: '/acnh/compare'},
            {id: 'jasper', label: 'My Cat', destination: '/jasper/index'},
            {id: 'chip8', label: 'CHIP-8', destination: '/chip8'},
            {id: 'about', label: 'About', destination: '/about/index'},
        ],
    },
    {
        id: "nav-small-things",
        label: "Small Things",
        nestedItems: [
            {id: 'salt-tracker', label: 'Salt Tracker', destination: '/salt_level/index'},
            {id: '3d-printing', label: '3D Printing', destination: '/3d_printing/index'},
        ],
    },
    {
        id: "nav-big-things",
        label: "Big Things",
        nestedItems: [
            {id: 'project-car', label: 'Project Car', destination: '/project_car/index'},
            {id: 'mame', label: 'MAME', destination: '/mame/index'},
            {id: 'workbench', label: 'Workbench', destination: '/workbench_v2/index'},
            {id: 'old-workbench', label: 'Old Workbench', destination: '/workbench/index'},
        ],
    },
    {
        id: "nav-resume",
        label: "Resume",
        destination: "/resume/index",
    }
];

export default NAVIGATION_DEFINITION;