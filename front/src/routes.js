/**
 =========================================================
 * Soft UI Dashboard React - v4.0.0
 =========================================================

 * Product Page: https://www.creative-tim.com/product/soft-ui-dashboard-react
 * Copyright 2022 Creative Tim (https://www.creative-tim.com)

 Coded by www.creative-tim.com

 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 */

// Soft UI Dashboard React pages



// Soft UI Dashboard React icons
import Shop from "components/Icons/Shop";
import Office from "components/Icons/Office";
import CustomerSupport from "components/Icons/CustomerSupport";
import PatientFormulaire from "./pages/patient-formulaire";
import Dashboard from "./pages/dashboard";
import Tables from "./pages/tables";
import Profile from "./pages/profile";


const routes = [
    {
        type: "collapse",
        name: "Dashboard",
        key: "dashboard",
        route: "/dashboard",
        icon: <Shop size="12px"/>,
        component: <Dashboard/>,
        noCollapse: true,
    },
    {
        type: "collapse",
        name: "Tables Patients",
        key: "tables",
        route: "/tables",
        icon: <Office size="12px"/>,
        component: <Tables/>,
        noCollapse: true,
    },
    {
        type: "",
        name: "Profile",
        key: "profile",
        route: "/profile",
        icon: <CustomerSupport size="12px"/>,
        component: <Profile/>,
        noCollapse: true,
    },
    {
        type: "collapse",
        name: "Création patient",
        key: "formulaire-patient",
        route: "/formulaire-patient",
        icon: <CustomerSupport size="12px"/>,
        component: <PatientFormulaire/>,
        noCollapse: true,
    }
];

export default routes;
