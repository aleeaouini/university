import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import axiosClient from '../api/axiosClient';

// eslint-disable-next-line no-unused-vars
const API_URL = "http://localhost:3004";


// ================= THEMES =================
const lightTheme = {
  background: '#ffffff', text: '#2d3748', textSecondary: '#718096',
  cardBg: '#f7fafc', border: '#e2e8f0',
  primary: '#4a90e2', primaryHover: '#357abd',
  danger: '#e53e3e', dangerHover: '#c53030',
  success: '#38a169', shadow: 'rgba(0,0,0,0.1)'
};

const darkTheme = {
  background: '#1a202c', text: '#f7fafc', textSecondary: '#a0aec0',
  cardBg: '#2d3748', border: '#4a5568',
  primary: '#4299e1', primaryHover: '#3182ce',
  danger: '#fc8181', dangerHover: '#f56565',
  success: '#68d391', shadow: 'rgba(0,0,0,0.3)'
};

// ================= GLOBAL STYLES =================
const GlobalStyle = createGlobalStyle`
  body { 
    background: ${({ theme }) => theme.background}; 
    color: ${({ theme }) => theme.text}; 
    margin:0; padding:0; 
    font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
  }
  * { box-sizing:border-box; }
`;


// ================= STYLED COMPONENTS =================
const Container = styled.div`min-height:100vh; padding:24px; background:${({ theme }) => theme.background};`;
const Header = styled.header`display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding-bottom:24px; border-bottom:2px solid ${({ theme }) => theme.border}; flex-wrap:wrap; gap:16px;`;
const Title = styled.h1`color:${({ theme }) => theme.text}; font-size:2.5rem; font-weight:700; margin:0;`;
const Button = styled.button`
  background: ${({ theme, variant }) => variant==='danger' ? theme.danger : variant==='success' ? theme.success : theme.primary};
  color:white; border:none; padding:12px 24px; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; transition:all 0.2s ease;
  &:hover { background:${({ theme, variant })=> variant==='danger' ? theme.dangerHover : variant==='success' ? '#2f855a' : theme.primaryHover}; }
  &:disabled { opacity:0.6; cursor:not-allowed; }
`;
const Controls = styled.div`display:flex; gap:12px; align-items:center;`;
const Grid = styled.div`display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:24px; max-width:1400px; margin:0 auto;`;
const EmptyState = styled.div`text-align:center; color:${({ theme }) => theme.textSecondary}; padding:80px 20px; grid-column:1/-1;`;
const Card = styled.div`background:${({ theme }) => theme.cardBg}; border:1px solid ${({ theme }) => theme.border}; border-radius:12px; padding:24px; box-shadow:0 2px 8px ${({ theme }) => theme.shadow}; transition:transform 0.2s ease, box-shadow 0.2s ease; &:hover { transform:translateY(-4px); box-shadow:0 4px 16px ${({ theme }) => theme.shadow}; }`;
const CardHeader = styled.div`display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:2px solid ${({ theme }) => theme.border};`;
const CardTitle = styled.h3`color:${({ theme }) => theme.text}; font-size:1.5rem; margin:0;`;
const CardBadge = styled.span`background:${({ theme, type }) => type==='TD' ? theme.success : type==='TP' ? theme.primary : '#805ad5'}; color:white; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; text-transform:uppercase;`;
const CardInfo = styled.div`display:flex; flex-direction:column; gap:8px;`;
const InfoRow = styled.div`display:flex; align-items:center; gap:8px; color:${({ theme }) => theme.textSecondary}; font-size:14px;`;
const InfoLabel = styled.span`font-weight:600; color:${({ theme }) => theme.text};`;
const CardActions = styled.div`display:flex; gap:8px; margin-top:16px; padding-top:16px; border-top:1px solid ${({ theme }) => theme.border};`;
const SmallButton = styled(Button)`padding:8px 16px; font-size:13px; flex:1;`;
const ErrorMessage = styled.div`background:#fee; border:1px solid #fcc; padding:12px; border-radius:8px; color:#c00; margin-bottom:16px; max-width:1400px; margin:0 auto 24px;`;

// ================= MODAL =================
const ModalOverlay = styled.div`position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;`;
const ModalContent = styled.div`background:${({ theme }) => theme.cardBg}; padding:32px; border-radius:12px; width:500px; max-width:90%; max-height:90vh; overflow-y:auto;`;
const ModalHeader = styled.h2`margin-top:0; color:${({ theme }) => theme.text}; font-size:1.75rem;`;
const FormContainer = styled.div`display:flex; flex-direction:column; gap:16px;`;
const FormGroup = styled.div`display:flex; flex-direction:column; gap:8px;`;
const Label = styled.label`color:${({ theme }) => theme.text}; font-weight:600; font-size:14px;`;
const Input = styled.input`padding:10px; border-radius:6px; border:1px solid ${({ theme }) => theme.border}; font-size:14px; background:${({ theme }) => theme.background}; color:${({ theme }) => theme.text}; &:focus { outline:none; border-color:${({ theme }) => theme.primary}; }`;
const Select = styled.select`padding:10px; border-radius:6px; border:1px solid ${({ theme }) => theme.border}; font-size:14px; background:${({ theme }) => theme.background}; color:${({ theme }) => theme.text}; &:focus { outline:none; border-color:${({ theme }) => theme.primary}; }`;
const ModalActions = styled.div`display:flex; gap:12px; margin-top:24px;`;

// ================= COMPONENT =================
function SallesManager() {
  const [theme, setTheme] = useState('light');
  const [salles, setSalles] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSalle, setCurrentSalle] = useState(null);
  const [formData, setFormData] = useState({ numero: '', type: 'cours', capacite: 30 });
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  useEffect(() => { fetchSalles(); }, []);

  // ================= FETCH SALLES =================
  const fetchSalles = async () => {
    try {
      setError(null);
      const { data } = await axiosClient.get('/salles');
      setSalles(data);
    } catch (err) {
      console.error("Erreur fetchSalles:", err);
      setSalles([]);
      setError('Erreur lors du chargement des salles');
    }
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async () => {
    if (!formData.numero || !formData.type || !formData.capacite) {
      setError('Tous les champs sont requis');
      return;
    }
    try {
      setError(null);
      if (editMode) {
        await axiosClient.put(`/salles/${currentSalle.id}`, formData);
      } else {
        await axiosClient.post('/salles', formData);
      }
      fetchSalles();
      handleCloseModal();
    } catch (err) {
      console.error("Erreur handleSubmit:", err);
      setError(`Erreur lors de la ${editMode ? 'modification' : 'création'} de la salle: ${err.message}`);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;
    try {
      setError(null);
      await axiosClient.delete(`/salles/${id}`);
      fetchSalles();
    } catch (err) {
      console.error("Erreur handleDelete:", err);
      setError(`Erreur lors de la suppression de la salle: ${err.message}`);
    }
  };

  const handleOpenModal = (salle = null) => {
    if (salle) {
      setEditMode(true);
      setCurrentSalle(salle);
      setFormData({ numero: salle.numero, type: salle.type, capacite: salle.capacite });
    } else {
      setEditMode(false);
      setCurrentSalle(null);
      setFormData({ numero: '', type: 'cours', capacite: 30 });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => { setModalOpen(false); setEditMode(false); setCurrentSalle(null); setFormData({ numero: '', type: 'cours', capacite: 30 }); };
  const toggleTheme = () => setTheme(theme==='light' ? 'dark' : 'light');

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <Container>
        <Header>
          <Title>🏫 Gestion des Salles</Title>
          <Controls>
            <Button variant="success" onClick={()=>handleOpenModal()}>➕ Ajouter une Salle</Button>
            <Button onClick={toggleTheme}>{theme==='light'?'🌙 Mode Sombre':'☀️ Mode Clair'}</Button>
          </Controls>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Grid>
          {salles.length===0 ? (
            <EmptyState><h2>Aucune salle disponible</h2><p>Cliquez sur "Ajouter une Salle" pour commencer</p></EmptyState>
          ) : (
            salles.map(salle=>(
              <Card key={salle.id}>
                <CardHeader>
                  <CardTitle>Salle {salle.numero}</CardTitle>
                  <CardBadge type={salle.type}>{salle.type}</CardBadge>
                </CardHeader>
                <CardInfo>
                  <InfoRow><InfoLabel>Type:</InfoLabel><span>{salle.type==='cours'?'Cours':salle.type==='TD'?'TD':'TP'}</span></InfoRow>
                  <InfoRow><InfoLabel>Capacité:</InfoLabel><span>{salle.capacite} personnes</span></InfoRow>
                  <InfoRow><InfoLabel>ID:</InfoLabel><span>#{salle.id}</span></InfoRow>
                </CardInfo>
                <CardActions>
                  <SmallButton onClick={()=>handleOpenModal(salle)}>✏️ Modifier</SmallButton>
                  <SmallButton variant="danger" onClick={()=>handleDelete(salle.id)}>🗑️ Supprimer</SmallButton>
                </CardActions>
              </Card>
            ))
          )}
        </Grid>

        {modalOpen && (
          <ModalOverlay onClick={handleCloseModal}>
            <ModalContent onClick={e=>e.stopPropagation()}>
              <ModalHeader>{editMode?'✏️ Modifier la Salle':'➕ Ajouter une Salle'}</ModalHeader>
              <FormContainer>
                <FormGroup>
                  <Label>Numéro de Salle *</Label>
                  <Input type="text" value={formData.numero} onChange={e=>setFormData({...formData, numero:e.target.value})} placeholder="Ex: A101, B205..." />
                </FormGroup>

                <FormGroup>
                  <Label>Type de Salle *</Label>
                  <Select value={formData.type} onChange={e=>setFormData({...formData, type:e.target.value})}>
                    <option value="cours">Cours</option>
                    <option value="TD">TD</option>
                    <option value="TP">TP</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Capacité *</Label>
                  <Input type="number" min="1" max="500" value={formData.capacite} onChange={e=>setFormData({...formData, capacite:parseInt(e.target.value)||0})} placeholder="Ex: 30, 50, 100..." />
                </FormGroup>

                <ModalActions>
                  <Button onClick={handleSubmit} style={{flex:1}}>{editMode?'💾 Enregistrer':'➕ Ajouter'}</Button>
                  <Button variant="danger" onClick={handleCloseModal} style={{flex:1}}>❌ Annuler</Button>
                </ModalActions>
              </FormContainer>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default SallesManager;
