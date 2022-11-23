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

// @mui material components
import Card from "@mui/material/Card";
import "./tables.css"

// Soft UI Dashboard React components
import SoftBox from "components/SoftBox";
import SoftTypography from "components/SoftTypography";
import SoftBadge from "components/SoftBadge";

// Soft UI Dashboard React examples
import DashboardLayout from "components/DashboardLayout";
import DashboardNavbar from "components/DashboardNavbar";
import Footer from "components/Footer";
import Table from "components/Table";

import PatientsService from "../../services/patients-service";
import { useEffect, useState } from "react";


function Patient({ nom, prenom }) {
  return (
    <SoftBox className="pointer" display="flex" flexDirection="column">
      <SoftTypography variant="button" fontWeight="medium" color="text">
        {nom+" "+prenom}
      </SoftTypography>
    </SoftBox>
  );
}

function BadgePatient({etat,aliveProba}){
  if(etat === 'VIVANT'){
    return(
      <SoftBadge variant="gradient" badgeContent={etat} color="success" size="xs" container />
    )
  }
  else if(etat === 'MORT'){
    return(      
      <SoftBadge variant="gradient" badgeContent={etat} color="warning" size="xs" container />
    )
  }else{
    return(
      <SoftBadge variant="gradient" badgeContent={"Survie: " + (aliveProba * 100) + "%"} color="info" size="xs" container />
    )
  }
}

function RowPatient({id,nom,prenom,genre,naissance,etat,aliveProba}){
   return({
      Id:id,
      Patient: <Patient  nom={nom} prenom={prenom} />,
      Genre: (genre === 'M') ? <SoftBadge variant="gradient" badgeContent={genre} color="blue" size="xs" container /> : <SoftBadge variant="gradient" badgeContent={genre} color="pink" size="xs" container />,
      Naissance: <SoftTypography variant="caption" fontWeight="medium" color="text">{naissance.substring(0, 10)}</SoftTypography>,
      Etat : BadgePatient({etat:etat,aliveProba:aliveProba})
   })
}

function Tables() {
  const nombrePatientsParPage = 12
  
  

  const columnsPatients =  [
    { name: "Patient", align: "left" },
    { name: "Genre", align: "center" },
    { name: "Naissance", align: "center" },
    { name: "Etat", align: "center" },
  ]

  const [tablePatients,setTablePatients] = useState({columns:columnsPatients,rows:[]})
  const [numeroPage,setNumeroPage] = useState(1)
  const [nombrePagesMax,setNombrePagesMax] = useState()


  const descendrePage = ()=> {
    if(numeroPage-1 > 0){
      setNumeroPage(numeroPage-1)
    }    
  }

  const monterPage = ()=> {
    if(numeroPage+1 <= nombrePagesMax){
      setNumeroPage(numeroPage+1)
    }    
  }

  useEffect(()=>{
    PatientsService.getNombrePagesPatients({size:nombrePatientsParPage})
    .then(response => {
      setNombrePagesMax(response.data)
    })
  },[])

  useEffect(()=>{
    PatientsService.getPagePatients({numPage:numeroPage-1,size:nombrePatientsParPage})
            .then(response => {
              var rowsPatients = []
              response.data.content.map((patient)=>{
                rowsPatients.push(RowPatient( {id:patient.id,nom:patient.lastName, prenom:patient.firstName, genre:patient.gender, naissance:patient.birthDate, etat:patient.state, aliveProba:patient.aliveProba} ))
              })
              setTablePatients({columns:columnsPatients,rows:rowsPatients})
            })
  }, [numeroPage])

  const { columns, rows } = tablePatients;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <SoftBox py={3}>
        <SoftBox mb={3}>
          <Card>
            <SoftBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <SoftTypography variant="h6">Patients</SoftTypography>
            </SoftBox>
            <SoftBox
              sx={{
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth, borderColor } }) =>
                      `${borderWidth[1]} solid ${borderColor}`,
                  },
                },
              }}
            >
              <Table columns={columns} rows={rows}/>
            </SoftBox>
          </Card>
        </SoftBox>
        <SoftBox align="center">
          <SoftTypography className={`pointer disable-text-selection ${(numeroPage-1 === 0) ? "inactive": ""}`} variant="button" fontWeight="medium" color="text" style={{ marginRight: '3em'}} onClick={descendrePage} >{"<"}</SoftTypography>
          <SoftTypography variant="button" fontWeight="medium" color="text" >{numeroPage} / {nombrePagesMax}</SoftTypography>
          <SoftTypography className={`pointer disable-text-selection ${(numeroPage === nombrePagesMax) ? "inactive": ""}`} variant="button" fontWeight="medium" color="text" style={{ marginLeft: '3em' }} onClick={monterPage} >{">"}</SoftTypography>
        </SoftBox>
      </SoftBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
