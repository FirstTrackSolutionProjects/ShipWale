import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import getAllWarehouseService from '../services/warehouseServices/getAllWarehousesService';
import createWarehouseService from '../services/warehouseServices/createWarehouseService';
import updateWarehouseService from '../services/warehouseServices/updateWarehouseService';
import retryCreateWarehouseService from '../services/warehouseServices/retryCreateWarehouseService';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../Constants';
import TextInput from './UiComponents/TextInput';
import SelectInput from './UiComponents/SelectInput';

const API_URL = import.meta.env.VITE_APP_API_URL;

// Same pagination UI pattern used in UpdateOrder.jsx
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const pages = [];
	const addPageNumber = (pageNum) => {
		pages.push({ number: pageNum, isCurrent: pageNum === currentPage });
	};

	addPageNumber(1);

	if (totalPages <= 7) {
		for (let i = 2; i < totalPages; i += 1) addPageNumber(i);
	} else if (currentPage <= 4) {
		for (let i = 2; i <= 5; i += 1) addPageNumber(i);
		pages.push({ number: '...' });
	} else if (currentPage >= totalPages - 3) {
		pages.push({ number: '...' });
		for (let i = totalPages - 4; i < totalPages; i += 1) addPageNumber(i);
	} else {
		pages.push({ number: '...' });
		for (let i = currentPage - 1; i <= currentPage + 1; i += 1) addPageNumber(i);
		pages.push({ number: '...' });
	}

	if (totalPages > 1) addPageNumber(totalPages);

	return (
		<div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-4">
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
			>
				<span className="hidden sm:inline">Previous</span>
				<span className="sm:hidden">Prev</span>
			</button>

			{pages.map((page, idx) => (
				<button
					key={idx}
					onClick={() => page.number !== '...' && onPageChange(page.number)}
					className={`min-w-[30px] px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${
						page.number === '...'
							? 'cursor-default'
							: page.isCurrent
								? 'bg-red-500 text-white'
								: 'bg-white hover:bg-gray-100 border'
					}`}
				>
					{page.number}
				</button>
			))}

			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm ${currentPage === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
			>
				<span className="hidden sm:inline">Next</span>
				<span className="sm:hidden">Next</span>
			</button>
		</div>
	);
};

const Warehouse = () => {
	const { role } = useAuth();
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [totalPages, setTotalPages] = useState(1);
	const [abortController, setAbortController] = useState(null);

	const baseColumns = {
		WAREHOUSE_ID: { headerName: 'ID', minWidth: 90 },
		WAREHOUSE_NAME: { headerName: 'Warehouse Name', minWidth: 200, filter: true, filterConfig: { type: 'text', default: '' } },
		WAREHOUSE_PHONE: { headerName: 'Warehouse Phone', minWidth: 150, filter: true, filterConfig: { type: 'text', default: '' } },
		WAREHOUSE_ADDRESS: { headerName: 'Warehouse Address', minWidth: 250, filter: false },
		WAREHOUSE_CITY: { headerName: 'City', minWidth: 120, filter: false },
		WAREHOUSE_STATE: { headerName: 'State', minWidth: 120, filter: false },
		WAREHOUSE_PINCODE: { headerName: 'Pincode', minWidth: 120, filter: false },
		USER_NAME: { headerName: 'User Name', minWidth: 200, roles: [USER_ROLES.ADMIN], filter: true, filterConfig: { type: 'text', default: '' } },
		USER_EMAIL: { headerName: 'User Email', minWidth: 220, roles: [USER_ROLES.ADMIN], filter: true, filterConfig: { type: 'text', default: '' } },
		BUSINESS_NAME: { headerName: 'Business Name', minWidth: 200, roles: [USER_ROLES.ADMIN], filter: true, filterConfig: { type: 'text', default: '' } },
		USER_PHONE: { headerName: 'User Phone', minWidth: 180, roles: [USER_ROLES.ADMIN], filter: true, filterConfig: { type: 'text', default: '' } },
		USER_ROLE: { headerName: 'Role', minWidth: 120, roles: [USER_ROLES.ADMIN], filter: true, filterConfig:{ type:'select', options:[{value:	USER_ROLES.ADMIN, label:'Admin'}, {value:USER_ROLES.MERCHANT, label:'Merchant'}] } },
		ACTIONS: { headerName: 'Actions', minWidth: 220, sortable: false, filterable: false, renderCell: (params) => (
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
					<Button variant="contained" size="small" onClick={() => openCheck(params.row)} sx={{ borderRadius: '4px' }}>
						Check
					</Button>
				</Box>
			)},
	};

	const filterObject = Object.keys(baseColumns).reduce((acc, key) => {
		const isAllowed = !baseColumns[key].roles || baseColumns[key].roles.includes(role);
		const hasFilter = Boolean(baseColumns[key].filter);
		if (!isAllowed || !hasFilter) return acc;
		acc[key] = baseColumns[key].filterConfig?.default || '';
		return acc;
	}, {});

	const [filters, setFilters] = useState(filterObject);
	const [debouncedFilters, setDebouncedFilters] = useState(filters);

	const [editOpen, setEditOpen] = useState(false);
	const [checkOpen, setCheckOpen] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);
	const [selectedWarehouse, setSelectedWarehouse] = useState(null);

	const [internationalAddress, setInternationalAddress] = useState('');
	const [saving, setSaving] = useState(false);
	const [creating, setCreating] = useState(false);
	const [createForm, setCreateForm] = useState({
		name: '',
		phone: '',
		address: '',
		internationalAddress: '',
		city: '',
		state: '',
		country: 'India',
		pin: '',
	});

	const [servicesLoading, setServicesLoading] = useState(false);
	const [servicesStatus, setServicesStatus] = useState([]);
	const [allCreated, setAllCreated] = useState(null);
	const [retrying, setRetrying] = useState(false);

	const [dataGridHeight, setDataGridHeight] = useState(Math.round(window.innerHeight * 0.65));
	useEffect(() => {
		const handleResize = () => setDataGridHeight(Math.round(window.innerHeight * 0.65));
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Debounce filter changes (same pattern as UpdateOrder.jsx)
	useEffect(() => {
		const timerId = setTimeout(() => {
			setPage(1);
			setDebouncedFilters(filters);
		}, 500);
		return () => clearTimeout(timerId);
	}, [filters]);

	useEffect(() => {
		const fetchWarehouses = async () => {
			if (abortController) abortController.abort();
			const newController = new AbortController();
			setAbortController(newController);

			setIsLoading(true);
			try {
				const query = {
					page,
					limit,
					...debouncedFilters
				};

				const result = await getAllWarehouseService(query, { signal: newController.signal });
				const data = result?.data || [];

				setRows(Array.isArray(data) ? data : []);
				setTotalPages(result?.totalPages || 1);
			} catch (error) {
				if (error?.name !== 'AbortError') {
					toast.error(error?.message || 'Failed to fetch warehouses');
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchWarehouses();
	}, [debouncedFilters, page]);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const openEdit = (warehouse) => {
		setSelectedWarehouse(warehouse);
		setInternationalAddress(warehouse?.international_address || '');
		setEditOpen(true);
	};

	const saveEdit = async () => {
		if (!selectedWarehouse?.WAREHOUSE_ID) return;
		try {
			setSaving(true);
			const cleaned = (internationalAddress || '').replace(/[^A-Za-z0-9\s,.\-'/]/g, '').trim();
			await updateWarehouseService(selectedWarehouse.WAREHOUSE_ID, { internationalAddress: cleaned });
			toast.success('Warehouse updated');
			setEditOpen(false);
			setDebouncedFilters((prev) => ({ ...prev }));
		} catch (error) {
			toast.error(error?.message || 'Failed to update warehouse');
		} finally {
			setSaving(false);
		}
	};

	const openCheck = async (warehouse) => {
		setSelectedWarehouse(warehouse);
		setServicesStatus([]);
		setAllCreated(null);
		setCheckOpen(true);
		setServicesLoading(true);
		try {
			const response = await fetch(`${API_URL}/warehouse/check`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: localStorage.getItem('token'),
				},
				body: JSON.stringify({ wid: warehouse?.WAREHOUSE_I }),
			});
			const data = await response.json();
			if (!data?.success) {
				throw new Error(data?.message || 'Failed to fetch service status');
			}
			setServicesStatus(data?.response || []);
			setAllCreated(Boolean(data?.all_created));
		} catch (error) {
			toast.error(error?.message || 'Failed to fetch service status');
		} finally {
			setServicesLoading(false);
		}
	};

	const retryWarehouseCreation = async () => {
		const wid = selectedWarehouse?.WAREHOUSE_ID;
		if (!wid) return;

		try {
			setRetrying(true);
			setServicesLoading(true);
			const data = await retryCreateWarehouseService(wid);
			setServicesStatus(data?.response || []);
			setAllCreated(Boolean(data?.all_created));
			if (data?.all_created) {
				toast.success('Warehouse created on all services');
			} else {
				toast.info('Retry triggered. Some services may still be pending.');
			}
		} catch (error) {
			toast.error(error?.message || 'Failed to retry warehouse creation');
		} finally {
			setRetrying(false);
			setServicesLoading(false);
		}
	};

	const openCreate = () => {
		setCreateForm({
			name: '',
			phone: '',
			address: '',
			internationalAddress: '',
			city: '',
			state: '',
			country: 'India',
			pin: '',
		});
		setCreateOpen(true);
	};

	const handleCreateFormChange = (e) => {
		const { name, value } = e.target;
		setCreateForm((prev) => ({ ...prev, [name]: value }));
	};

	const saveCreate = async () => {
		const payload = {
			name: (createForm.name || '').trim(),
			phone: (createForm.phone || '').trim(),
			address: (createForm.address || '').trim(),
			internationalAddress: (createForm.internationalAddress || '').trim(),
			city: (createForm.city || '').trim(),
			state: (createForm.state || '').trim(),
			country: (createForm.country || '').trim(),
			pin: (createForm.pin || '').trim(),
		};

		if (!payload.name || !payload.phone || !payload.address || !payload.city || !payload.state || !payload.country || !payload.pin) {
			toast.error('Please fill all required fields');
			return;
		}

		try {
			setCreating(true);
			await createWarehouseService(payload);
			toast.success('Warehouse created');
			setCreateOpen(false);
			setPage(1);
			setDebouncedFilters((prev) => ({ ...prev }));
		} catch (error) {
			toast.error(error?.message || 'Failed to create warehouse');
		} finally {
			setCreating(false);
		}
	};

	const columns = useMemo(() => {

		const columnsToRender = Object.keys(baseColumns)
		.filter((key) => !baseColumns[key].roles || baseColumns[key].roles.includes(role))
		.map((key) => ({ field: key, ...baseColumns[key] }));

		return columnsToRender;
	}, []);

	return (
		<div className="w-full p-4 flex flex-col items-center gap-4">
			{/* Header */}
			<div className="w-full px-4 relative flex">
				<div className="w-full flex items-center justify-between">
					<div className="text-2xl font-medium">WAREHOUSES</div>
					{role !== USER_ROLES.ADMIN ? (
						<Button variant="contained" onClick={openCreate} sx={{ borderRadius: '4px' }}>
							Create Warehouse
						</Button>
					) : null}
				</div>
			</div>

			{/* Filters */}
			<Paper sx={{ p: 2, width: '100%', overflowX: 'auto' }}>
				<Box sx={{ display: 'inline-flex', gap: 2, alignItems: 'center', minWidth: '900px', whiteSpace: 'nowrap' }}>
					{Object.keys(filterObject).map((key) => {
						const filterConfig = baseColumns[key].filterConfig || {};
						const filterType = filterConfig.type || 'text';
						switch (filterType) {
							case 'text':
								return (
									<TextInput
										name={key}
										label={baseColumns[key].headerName}
										key={key}
										formData={filters}
										handleChange={handleFilterChange}
									/>
								);
							case 'select':
								return (
									<SelectInput
										name={key}
										label={baseColumns[key].headerName}
										key={key}
										formData={filters}
										handleChange={handleFilterChange}
										options={filterConfig.options || []}
									/>
								);
							default:
								return null;
						}
					})}
				</Box>
			</Paper>

			{/* DataGrid */}
			<Box sx={{ height: `${dataGridHeight}px`, width: '100%' }}>
				<DataGrid
					rows={rows}
					columns={columns}
					loading={isLoading}
					hideFooter={true}
					disableSelectionOnClick
					getRowId={(row) => row.WAREHOUSE_ID}
					rowHeight={56}
					sx={{
						border: '1px solid #000',
						borderRadius: 0,
						'& .MuiDataGrid-columnHeaders': {
							borderBottom: '1px solid #000',
							backgroundColor: '#A34757',
							color: '#FFF',
						},
						'& .MuiDataGrid-columnHeader': {
							backgroundColor: '#A34757',
							fontWeight: 'bold',
						},
						'& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
							borderRight: '1px solid #000',
						},
						'& .MuiDataGrid-columnHeader:first-of-type, & .MuiDataGrid-cell:first-of-type': {
							borderLeft: '1px solid #000',
						},
						'& .MuiDataGrid-row': {
							borderBottom: '1px solid #000',
						},
					}}
				/>
			</Box>

			{/* Custom Pagination */}
			<Pagination currentPage={page} totalPages={totalPages} onPageChange={(newPage) => setPage(newPage)} />

			{/* Edit dialog */}
			<Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
				<DialogTitle>Edit Warehouse</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<TextField
							label="Warehouse Name"
							size="small"
							value={selectedWarehouse?.warehouseName || ''}
							InputProps={{ readOnly: true }}
						/>
						<TextField
							label="Warehouse Phone"
							size="small"
							value={selectedWarehouse?.phone || ''}
							InputProps={{ readOnly: true }}
						/>
						<TextField
							label="International Address"
							size="small"
							value={internationalAddress}
							onChange={(e) => {
								const raw = e.target.value || '';
								const cleaned = raw.replace(/[^A-Za-z0-9\s,.\-'/]/g, '');
								setInternationalAddress(cleaned);
							}}
							placeholder="Allowed symbols are , . - ' /"
							inputProps={{ maxLength: 60 }}
						/>
						<Typography variant="caption" color="text.secondary">
							Allowed symbols: , . - ' /
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
					<Button variant="contained" onClick={saveEdit} disabled={saving}>
						{saving ? 'Updating...' : 'Update'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Check dialog */}
			<Dialog open={checkOpen} onClose={() => setCheckOpen(false)} fullWidth maxWidth="md">
				<DialogTitle>
					Warehouse Services Status {selectedWarehouse?.WAREHOUSE_ID ? `(WID: ${selectedWarehouse.WAREHOUSE_ID})` : ''}
				</DialogTitle>
				<DialogContent>
					{!servicesLoading && allCreated === false ? (
						<Box sx={{ mb: 2 }}>
							<Paper sx={{ p: 1.5, backgroundColor: '#fef3c7' }}>
								<Typography variant="body2">Warehouse failed to create on some services.</Typography>
							</Paper>
						</Box>
					) : null}

					<Box sx={{ height: 420, width: '100%' }}>
						<DataGrid
							rows={(servicesStatus || []).map((s, idx) => ({ id: `${s.service_id}-${idx}`, ...s }))}
							columns={[
								{ field: 'service_id', headerName: 'Service ID', width: 120 },
								{ field: 'service_name', headerName: 'Service', width: 220 },
								{
									field: 'warehouse_created',
									headerName: 'Status',
									width: 160,
									renderCell: (params) => (
										<Box
											sx={{
												px: 1.5,
												py: 0.5,
												borderRadius: 2,
												fontSize: '0.875rem',
												minWidth: 120,
												textAlign: 'center',
												lineHeight: 1.5,
												backgroundColor: params.value ? '#dcfce7' : '#fee2e2',
												color: params.value ? '#166534' : '#dc2626',
											}}
										>
											{params.value ? 'Online' : 'Failed'}
										</Box>
									),
								},
							]}
							loading={servicesLoading}
							hideFooter
							disableSelectionOnClick
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					{(allCreated === false && role !== USER_ROLES.ADMIN) ? (
						<Button
							variant="contained"
							onClick={retryWarehouseCreation}
							disabled={servicesLoading || retrying}
							sx={{ borderRadius: '4px' }}
						>
							{retrying ? 'Retrying...' : 'Retry'}
						</Button>
					) : null}
					<Button onClick={() => setCheckOpen(false)}>Close</Button>
				</DialogActions>
			</Dialog>

			{/* Create dialog */}
			<Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
				<DialogTitle>Create Warehouse</DialogTitle>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<TextField
							label="Warehouse Name"
							name="name"
							size="small"
							value={createForm.name}
							onChange={handleCreateFormChange}
							inputProps={{ maxLength: 32 }}
							required
						/>
						<TextField
							label="Phone"
							name="phone"
							size="small"
							value={createForm.phone}
							onChange={(e) => {
								const next = (e.target.value || '').replace(/[^0-9+\s-]/g, '');
								setCreateForm((prev) => ({ ...prev, phone: next }));
							}}
							required
						/>
						<TextField
							label="Address"
							name="address"
							size="small"
							value={createForm.address}
							onChange={handleCreateFormChange}
							required
						/>
						<TextField
							label="City"
							name="city"
							size="small"
							value={createForm.city}
							onChange={handleCreateFormChange}
							required
						/>
						<TextField
							label="State"
							name="state"
							size="small"
							value={createForm.state}
							onChange={handleCreateFormChange}
							required
						/>
						<TextField
							label="Country"
							name="country"
							size="small"
							value={createForm.country}
							onChange={handleCreateFormChange}
							required
						/>
						<TextField
							label="Pincode"
							name="pin"
							size="small"
							value={createForm.pin}
							onChange={(e) => {
								const next = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
								setCreateForm((prev) => ({ ...prev, pin: next }));
							}}
							required
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
					<Button variant="contained" onClick={saveCreate} disabled={creating}>
						{creating ? 'Creating...' : 'Create'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default Warehouse;
